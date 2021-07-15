const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
const ResponseUtil = require('../util/Response');
var express = require('express');
const bcrypt = require('bcryptjs')
const RollCallReport = require('../models/RollCallReport');
const ClassInfo = require('../models/ClassInfo');
const stringMessage = require('../value/string');
const QR = require('../util/QR')
const router = express.Router()
const userUtil = require('../util/UserUtils')
const reportUtil = require('../util/ReportUtils')
const excel = require('excel4node');



/**
 * @typedef ListReports
 * @property {integer} count.required - số lượng phần tử
 * @property {Array.<RollCallReport>} data.required - các phần tử
 */

/**
 * @typedef ReportConfig
 * @property {string} checkinLimitTime.required - Thời gian giới hạn điểm danh
 * @property {boolean} allowLate.required - Cho phép đi trễ
 */

/**
 * Tạo danh sách điểm danh. Chỉ có tài khoản có quyền Admin hoặc teacher mới thực hiện được chức năng này.
 * @route POST /reports/{class_id}
 * @group Report
 * @param {string} class_id.path.required - id lớp cần điểm danh
 * @param {ReportConfig.model} config.body.required - config cho bảng điểm danh
 * @returns {RollCallReport.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.post('/:class_id', auth.isReporter, async (req, res) => {
    // Create a new report
    try {
        const classInfo = await findClass(req.params.class_id);
        let idx = reportUtil.isAbleCreatedReport(classInfo.schedule);
        if(idx == -1){
            throw new Error(stringMessage.create_report_time_expired);
        }
        if(await findReport(reportUtil.getDate(), classInfo.shift)){
            return res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.report_exist))
        }
        let report = {
            id: reportUtil.genReportId(classInfo.id, classInfo.schedule[idx]),
            ...req.body,
            subject: classInfo.id,
            content: classInfo.students.map(student => ({
                user: student,
                status: 'absent'
            })),
            expired: classInfo.shift === '0' ? '11:30' : '4:30',
            shift: classInfo.shift
        }
        const newReport = new RollCallReport(report);
        await newReport.save();
        res.status(201).send(ResponseUtil.makeResponse(report));
    } catch (error) {
        console.log(error);
        if(error.code == 11000){
            return res.status(400).send(ResponseUtil.makeMessageResponse(ErrorUtil.makeErrorValidateMessage(JSON.stringify(error.keyValue))));
        }
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})

/**
 * Tải về danh sách điểm danh. Chỉ có tài khoản đăng nhập mới thực hiện được chức năng này.
 * @route GET /reports/{id}/download
 * @group Report
 * @param {string} id.path.required - id bảng điểm danh
 * @returns {Error.model} 200 - File excel chứa report.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.get('/:id/download', async (req, res) => {
    // Create a new report
    try {
        let reportFile = await genExcelReport(req.params.id);
        reportFile.write('Report.xlsx', res);
    } catch (error) {
        console.log(error);
        if(error.code == 11000){
            return res.status(400).send(ResponseUtil.makeMessageResponse(ErrorUtil.makeErrorValidateMessage(JSON.stringify(error.keyValue))));
        }
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})


async function findClass(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('students').populate('monitors').populate('teacher');
    return classInfo;
}
async function findReport(date, shift){
    const report = await RollCallReport.findOne({date: date, shift: shift }).populate('content');
    return report;
}

async function findClassInfo(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('teacher');
    if(!classInfo){
        throw new Error(stringMessage.class_not_found);
    }
    return classInfo;
}

async function findReportById(reportId){
    const report = await RollCallReport.findOne({id: reportId}).populate('content');
    if(!report){
        throw new Error(stringMessage.report_not_found);
    }
    return report;
}

async function genExcelReport(reportId){
    let report = await findReportById(reportId);
    console.log(report.subject);
    let classInfo = await findClassInfo(report.subject);
    let workbook = new excel.Workbook();
    let reportSheet = workbook.addWorksheet(report.date);

    let title = "Báo Cáo Điểm Danh";
    let subject = "Môn: " + classInfo.name;
    let teacher = "Giảng viên: " + classInfo.teacher.name;
    let shift = report.shift == 0 ? 'Sáng' : 'Chiều';
    let date = "Buổi: " + shift + "- Ngày: " + report.date;

    let titleStyle = workbook.createStyle({
        font: {
          color: '#FF0800',
          size: 15
        },
      });

    let rowStyle = workbook.createStyle({
        font: {
          color: '#000000',
          size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            bgColor: '#CCECFF',
            fgColor: '#CCECFF',
          },
        border: {
            left: {
                style: 'thin',
                color: 'black',
            },
            right: {
                style: 'thin',
                color: 'black',
            },
            top: {
                style: 'thin',
                color: 'black',
            },
            bottom: {
                style: 'thin',
                color: 'black',
            },
            outline: false,
          },
      });

      reportSheet.cell(1, 1, 1, 5, true).string(title).style(titleStyle);
      reportSheet.cell(2, 1, 2, 5, true).string(subject).style(titleStyle);
      reportSheet.cell(3, 1, 3, 5, true).string(teacher).style(titleStyle);
      reportSheet.cell(4, 1, 4, 5, true).string(date).style(titleStyle);
      
      reportSheet.cell(5, 1).string('STT').style(rowStyle);
      reportSheet.cell(5, 2).string('MSSV').style(rowStyle);
      reportSheet.cell(5, 3).string('TÊN').style(rowStyle);
      reportSheet.cell(5, 4).string(report.date).style(rowStyle);


      return workbook;
}

function createReportArray(report){
    reportArray
}


module.exports = router;