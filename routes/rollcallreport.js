const auth  = require('../middleware/auth');
const ErrorUtil = require('../util/ErrorUtil');
const ResponseUtil = require('../util/Response');
var express = require('express');
const bcrypt = require('bcryptjs');
const RollCallReport = require('../models/RollCallReport');
const ClassInfo = require('../models/ClassInfo');
const stringMessage = require('../value/string');
const QR = require('../util/QR');
const router = express.Router();
const userUtil = require('../util/UserUtils');
const reportUtil = require('../util/ReportUtils');
const styleWorkbook = require('../util/StyleWorkbook');
const excel = require('excel4node');
const rollcallReport = require('../models/RollCallReport');



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
 * @typedef TeacherCheckin
 * @property {string} studentId.required - Id của sinh viên điểm danh
 */

/**
 * Tạo danh sách điểm danh. Chỉ có tài khoản có quyền Admin hoặc teacher mới thực hiện được chức năng này.
 * @route POST /reports/{class_id}
 * @group Report
 * @param {string} class_id.path.required - id lớp cần điểm danh
 * @param {ReportConfig.model} config.body.required - config cho bảng điểm danh
 * @returns {ListReports.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.post('/:class_id', auth.isReporter, async (req, res) => {
    // Create a new report
    try {
        const classInfo = await findClass(req.params.class_id);
        if(req.user.id !== classInfo.teacher.id && req.user.role !== 'admin'){
            throw new Error(stringMessage.not_auth);
        }
        let idx = reportUtil.isAbleCreatedReport(classInfo.schedule);
        if(idx == -1){
            throw new Error(stringMessage.create_report_time_expired);
        }
        let report = await findReport(reportUtil.getDate(), classInfo.id, classInfo.shift)
        if(report){
            return res.status(200).send(ResponseUtil.makeResponse(report));
        }
        report = {
            id: reportUtil.genReportId(classInfo.id, classInfo.schedule[idx]),
            ...req.body,
            subject: classInfo.id,
            subjectName: classInfo.name,
            teacher: classInfo.teacher,
            content: classInfo.students.map(student => ({
                user: student,
                status: 'absent'
            })),
            expired: classInfo.shift === '0' ? '11:30' : '16:30',
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
 * Lấy tất cả danh sách điểm danh theo môn. Chỉ có tài khoản có quyền Admin hoặc teacher mới thực hiện được chức năng này.
 * @route GET /reports/{class_id}
 * @group Report
 * @param {string} class_id.path.required - id lớp cần điểm danh
 * @returns {ListReports.model} 200 - Thông tin tài khoản và token ứng với tài khoản đó.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.get('/:class_id', auth.isReporter, async (req, res) => {
    // Create a new report
    try {
        const report = await RollCallReport.find({subject: req.params.class_id}).populate({ 
            path: 'content',
            populate: {
              path: 'user',
              model: 'User'
            } 
         });

        if(report){
            return res.status(201).send(ResponseUtil.makeResponse(report));
        }
        else{
            return res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.report_not_found));
        }
        
    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})

/**
 * Lấy dữ liệu điểm danh của lớp theo ngày.
 * @route GET /reports/{class_id}/{date}/status
 * @group Report
 * @param {string} id.path.required - id của lớp
 * @param {string} date.path.required - ngày, format dd:mm:yyyy
 * @returns {ListReports.model} 200 - Report
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.get('/:class_id/:date/status' ,async (req, res) => {
    // Create a new report
    try {

        let report = await RollCallReport.findOne({subject: req.params.class_id, date: req.params.date}).populate({ 
            path: 'content',
            populate: {
              path: 'user',
              model: 'User'
            } 
        });

        if(report){
            console.log(report);
            return res.status(200).send(ResponseUtil.makeResponse(report));
        }
        else{
            return res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.report_not_found));
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})



/**
 * Tải về tổng hợp danh sách điểm danh của một môn.
 * @route GET /reports/{class_id}/download-all
 * @group Report
 * @param {string} class_id.path.required - id môn học
 * @returns {Error.model} 200 - File excel chứa report.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 */
 router.get('/:class_id/download-all' ,async (req, res) => {
    // Create a new report
    try {
        console.log(req.params.class_id);
        let reportFile = await genExcelReportAll(req.params.class_id);
        reportFile.write('Report.xlsx', res);
    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})


/**
 * Tải về danh sách điểm danh.
 * @route GET /reports/{id}/download
 * @group Report
 * @param {string} id.path.required - id bảng điểm danh
 * @returns {Error.model} 200 - File excel chứa report.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 */
 router.get('/:id/download' ,async (req, res) => {
    // Create a new report
    try {
        let reportFile = await genExcelReport(req.params.id);
        reportFile.write('Report.xlsx', res);
    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})


/**
 * Lấy dữ liệu điểm danh.
 * @route GET /reports/{id}/status
 * @group Report
 * @param {string} id.path.required - id report
 * @returns {ListReports.model} 200 - Report
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.get('/:id/status' ,async (req, res) => {
    // Create a new report
    try {
        let report = await findReportById(req.params.id);
        if(report){
            return res.status(200).send(ResponseUtil.makeResponse(report));
        }
        else{
            return res.status(404).send(ResponseUtil.makeMessageResponse(stringMessage.report_not_found));
        }
    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})







/**
 * Điểm danh. Chỉ có tài khoản sinh viên mới thực hiện được chức năng này.
 * @route POST /reports/{id}/checkin
 * @group Report
 * @param {string} id.path.required - id bảng điểm danh
 * @returns {Error.model} 200 - trạng thái điểm danh: ontime, late hoặc absent.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.post('/:id/checkin', auth.isStudent ,async (req, res) => {
    // Create a new report
    try {
        let student = req.user;
        let report = await findReportById(req.params.id);
        //console.log(report);
        let status = reportUtil.getStatusCheckin(report);
        // if(!reportUtil.isAbleToCheckin(report.date)){
        //     return res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.user_cant_checkin_bc_date));
        // }
        let check = 0;
        for(const item of report.content){
            if (item.user && item.user.id === student.id){
                if(item.status !== 'absent'){
                    return res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.student_checked));
                }
                item.status = status;
                check = 1;
            }
        }
        if(check){
            await report.save();
            //console.log(ResponseUtil.makeMessageResponse(stringMessage[status]));
            return res.status(200).send(ResponseUtil.makeMessageResponse(stringMessage[status]));
        }
        return res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.student_not_in_class));
        

    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})

/**
 * Điểm danh bởi giáo viên. Chỉ có tài khoản giáo viên mới thực hiện được chức năng này. Dùng điện thoại để quét QR/thẻ sinh viên để điểm danh.
 * @route POST /reports/{id}/teachercheckin
 * @group Report
 * @param {string} id.path.required - id bảng điểm danh
 * @param {TeacherCheckin.model} studentId.body.required - Id của student cần điểm danh
 * @returns {Error.model} 200 - trạng thái điểm danh: ontime, late hoặc absent.
 * @returns {Error.model} 400 - Thông tin trong Body bị sai hoặc thiếu.
 * @returns {Error.model} 401 - Không có đủ quyền để thực hiện chức năng.
 * @security Bearer
 */
 router.post('/:id/teachercheckin', auth.isTeacher ,async (req, res) => {
    // Create a new report
    try {
        let studentId = req.user.body.studentId;
        let report = await findReportById(req.params.id);
        let student = await findUser(studentId);
        if(!student){
            throw new Error(stringMessage.user_not_found);
        }
        let status = reportUtil.getStatusCheckin(report);
        let check = 0;
        for(const item of report.content){
            if (item.user && item.user.id === student.id){
                if(item.status !== 'absent'){
                    return res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.student_checked));
                }
                item.status = status;
                check = 1;
            }
        }
        if(check){
            await report.save();
            //console.log(ResponseUtil.makeMessageResponse(stringMessage[status]));
            return res.status(200).send(ResponseUtil.makeMessageResponse(stringMessage[status]));
        }
        return res.status(400).send(ResponseUtil.makeMessageResponse(stringMessage.student_not_in_class));
        

    } catch (error) {
        console.log(error);
        res.status(400).send(ResponseUtil.makeMessageResponse(error.message))
    }
})



async function findUser(userId){
    return await User.findOne({id: userId});
}

async function findClass(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('students').populate('monitors').populate('teacher');
    if(!classInfo){
        throw new Error(stringMessage.class_not_found);
    }
    return classInfo;
}

async function findReport(date, subject, shift){
    const report = await RollCallReport.findOne({date: date, subject: subject, shift: shift}).populate({ 
        path: 'content',
        populate: {
          path: 'user',
          model: 'User'
        } 
     });
    return report;
}



async function findAllReportBySubject(class_id){
    return await RollCallReport.findOne({subject: class_id}).populate({ 
        path: 'content',
        populate: {
          path: 'user',
          model: 'User'
        } 
    });
}

async function findClassInfo(classId){
    const classInfo = await ClassInfo.findOne({id: classId }).populate('teacher');
    if(!classInfo){
        throw new Error(stringMessage.class_not_found);
    }
    return classInfo;
}

async function findReportById(reportId){
    const report = await RollCallReport.findOne({id: reportId}).populate({ 
        path: 'content',
        populate: {
          path: 'user',
          model: 'User'
        } 
     });
    if(!report){
        throw new Error(stringMessage.report_not_found);
    }
    return report;
}

async function genExcelReport(reportId){
    let report = await findReportById(reportId);
    //console.log(report.content[0].user);
    let classInfo = await findClassInfo(report.subject);
    let workbook = new excel.Workbook();
    let reportSheet = workbook.addWorksheet(report.date);

    let title = "Báo Cáo Điểm Danh";
    let subject = "Môn: " + classInfo.name;
    let teacher = "Giảng viên: " + classInfo.teacher.name;
    let shift = report.shift == 0 ? 'Sáng' : 'Chiều';
    let date = "Buổi: " + shift + " - Ngày: " + report.date;

    let titleStyle = workbook.createStyle(styleWorkbook.titleStyle);

    let rowTitleStyle = workbook.createStyle(styleWorkbook.rowTitleStyle);

    let rowStyle = workbook.createStyle(styleWorkbook.rowStyle);
    
    //let border = workbook.createStyle(styleWorkbook.border);

    reportSheet.cell(1, 1, 1, 5, true).string(title).style(titleStyle);
    reportSheet.cell(2, 1, 2, 5, true).string(subject).style(titleStyle);
    reportSheet.cell(3, 1, 3, 5, true).string(teacher).style(titleStyle);
    reportSheet.cell(4, 1, 4, 5, true).string(date).style(titleStyle);
    
    reportSheet.cell(5, 1).string('STT').style(rowTitleStyle);
    reportSheet.cell(5, 2).string('MSSV').style(rowTitleStyle);
    reportSheet.cell(5, 3).string('TÊN').style(rowTitleStyle);
    reportSheet.cell(5, 4).string(report.date).style(rowTitleStyle);

    let curCell = 6;
    let total = 0;
    let total_late = 0;
    let total_absent = 0;
    let total_ontime = 0;
    for(const item of report.content){
        //console.log(item.user);
        if(item.user === null){
            continue;
        }
        reportSheet.cell(curCell, 1).number(++total).style(rowStyle);
        reportSheet.cell(curCell, 2).string(item.user.id).style(rowStyle);
        reportSheet.cell(curCell, 3).string(item.user.name).style(rowStyle);

        switch(item.status){
            case 'ontime':{
                reportSheet.cell(curCell, 4).string(stringMessage.ontime).style(rowStyle);
                total_ontime++;
                break;
            }
            case 'late':{
                reportSheet.cell(curCell, 4).string(stringMessage.late).style(rowStyle);
                total_late++;
                break;
            }  
            case 'absent':{
                reportSheet.cell(curCell, 4).string(stringMessage.absent).style(rowStyle);
                total_absent++;
                break;
            }
        }
        curCell++;
    }
    reportSheet.column(2).setWidth(15);
    reportSheet.column(3).setWidth(30);
    curCell += 2;
    reportSheet.cell(curCell, 1).string("Tổng số").style(rowTitleStyle);
    reportSheet.cell(curCell++, 2).number(total).style(rowTitleStyle);
    reportSheet.cell(curCell, 1).string("Đúng giờ:").style(rowStyle);
    reportSheet.cell(curCell++, 2).number(total_ontime).style(rowStyle);
    reportSheet.cell(curCell, 1).string("Trễ:").style(rowStyle);
    reportSheet.cell(curCell++, 2).number(total_late).style(rowStyle);
    reportSheet.cell(curCell, 1).string("Vắng:").style(rowStyle);
    reportSheet.cell(curCell, 2).number(total_absent).style(rowStyle);
    return workbook;
}

async function genExcelReportAll(classId){
    let report = await findAllReportBySubject(classId)
    //console.log(report.content[0].user);
    //console.log(classId);
    let classInfo = await findClass(classId);
    console.log(classInfo);
    let workbook = new excel.Workbook();
    let reportSheet = workbook.addWorksheet(classInfo.id);


    let title = "Báo Cáo Điểm Danh";
    let subject = "Môn: " + classInfo.name;
    let teacher = "Giảng viên: " + classInfo.teacher.name;
    let shift = classInfo.shift == 0 ? 'Sáng' : 'Chiều';
    let date = "Buổi: " + shift + " - Ngày bắt đầu: " + (classInfo.schedule[0].split('@')[1]);

    let titleStyle = workbook.createStyle(styleWorkbook.titleStyle);

    let rowTitleStyle = workbook.createStyle(styleWorkbook.rowTitleStyle);

    let rowStyle = workbook.createStyle(styleWorkbook.rowStyle);
    //let border = workbook.createStyle(styleWorkbook.border);

    reportSheet.cell(1, 1, 1, 5, true).string(title).style(titleStyle);
    reportSheet.cell(2, 1, 2, 5, true).string(subject).style(titleStyle);
    reportSheet.cell(3, 1, 3, 5, true).string(teacher).style(titleStyle);
    reportSheet.cell(4, 1, 4, 5, true).string(date).style(titleStyle);
    
    reportSheet.cell(5, 1).string('STT').style(rowTitleStyle);
    reportSheet.cell(5, 2).string('MSSV').style(rowTitleStyle);
    reportSheet.cell(5, 3).string('TÊN').style(rowTitleStyle);
    

    const studentPosition = new Map();
    let pos = 6;
    let total = 0;
    for (student of classInfo.students){
        console.log(student);
        if (student){
            studentPosition.set(student.id, pos);
            reportSheet.cell(pos, 1).number(++total).style(rowStyle);
            reportSheet.cell(pos, 2).string(student.id).style(rowStyle);
            reportSheet.cell(pos, 3).string(student.name).style(rowStyle);
            pos++;
        }
    }
    let reportCol = 4;
    for(const date of classInfo.schedule){
        //console.log(item.user);
        let dateInfo = date.split('@');
        let report = await findReport(dateInfo[1], classInfo.id, dateInfo[0]);
        reportSheet.cell(5, reportCol).string(dateInfo[1]).style(rowTitleStyle);
        if (report){
            // put dữ liệu điểm danh
            for(const item of report.content){
                //console.log(item.user);
                if(item.user === null){
                    continue;
                }
                console.log(item);
                console.log(studentPosition.get(item.user.id) + " " + reportCol)
                switch(item.status){
                    case 'ontime':{
                        reportSheet.cell(studentPosition.get(item.user.id), reportCol).string(stringMessage.ontime).style(rowStyle);
                        
                        break;
                    }
                    case 'late':{
                        reportSheet.cell(studentPosition.get(item.user.id), reportCol).string(stringMessage.late).style(rowStyle);
                        
                        break;
                    }  
                    case 'absent':{
                        reportSheet.cell(studentPosition.get(item.user.id), reportCol).string(stringMessage.absent).style(rowStyle);
                        
                        break;
                    }
                }
            }
        }
        reportCol++;
    }
    console.log({pos: pos, reportCol: reportCol});
    reportSheet.cell(5, 4, pos-1, reportCol-1).style(rowStyle);
    reportSheet.column(2).setWidth(15);
    reportSheet.column(3).setWidth(30);
    return workbook;
}



module.exports = router;