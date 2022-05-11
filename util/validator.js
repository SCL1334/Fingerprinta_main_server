const Joi = require('joi').extend(require('@joi/date'));

// if no date format, e.g. 20220501 will still pass the validator
// but the date will parse to 1970-01-01 and save todb without error!!
const dateFormat = ['YYYY-MM-DD', 'YYYYMMDD'];

const prohibit = /[$(){}<>]/;

// 00:00 to 23:59
const timeFormat = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;

// min length of password
const pwdMin = 4;

// incomplete 上傳檔案 / 多帳號

// Schemas

const createClassGroupTypeSchema = Joi.object({
  name: Joi.string().max(20).required().regex(prohibit, { invert: true }),
});

const createLeaveTypeSchema = Joi.object({
  name: Joi.string().max(15).required().regex(prohibit, { invert: true }),
  need_calculate: Joi.boolean().allow(null),
});

const createClassSchema = Joi.object({
  class_type_id: Joi.number().integer().min(1).required(),
  batch: Joi.number().integer().min(1).required(),
  class_group_id: Joi.number().integer().min(1),
  start_date: Joi.date().format(dateFormat).required(),
  end_date: Joi.date().format(dateFormat).min(Joi.ref('start_date')).required(),
});

const editClassSchema = Joi.object({
  class_type_id: Joi.number().integer().min(1),
  batch: Joi.number().integer().min(1),
  class_group_id: Joi.number().integer().min(1),
  start_date: Joi.date().format(dateFormat),
  end_date: Joi.date().format(dateFormat).min(Joi.ref('start_date')),
});

const createClassRoutineSchema = Joi.object({
  class_type_id: Joi.number().integer().min(1).required(),
  weekday: Joi.number().min(0).max(6).required(),
  start_time: Joi.string().regex(timeFormat),
  end_time: Joi.string().regex(timeFormat),
});

const editClassRoutineSchema = Joi.object({
  class_type_id: Joi.number().integer().min(1),
  weekday: Joi.number().min(0).max(6),
  start_time: Joi.string().regex(timeFormat),
  end_time: Joi.string().regex(timeFormat),
});

const createPunchExceptionSchema = Joi.object({
  class_type_id: Joi.number().integer().min(1).required(),
  batch: Joi.number().integer().min(1).required(),
  date: Joi.date().format(dateFormat).required(),
  start: Joi.string().regex(timeFormat),
  end: Joi.string().regex(timeFormat),
});

const createStudentSchema = Joi.object({
  name: Joi.string().trim().required().regex(prohibit, { invert: true }),
  email: Joi.string().email().trim().lowercase()
    .required(),
  password: Joi.string().min(pwdMin).trim().strict()
    .required(),
  class_id: Joi.number().integer().min(1).required(),
});

const editStudentSchema = Joi.object({
  name: Joi.string().trim().regex(prohibit, { invert: true }),
  email: Joi.string().email().trim().lowercase(),
  class_id: Joi.number().integer().min(1),
});

const createStaffSchema = Joi.object({
  name: Joi.string().trim().required().regex(prohibit, { invert: true }),
  email: Joi.string().email().trim().lowercase()
    .required(),
  password: Joi.string().min(pwdMin).trim().strict()
    .required(),
});

const changePasswordSchema = Joi.object({
  password: Joi.string().min(pwdMin).trim().strict()
    .required(),
  new_password: Joi.string().min(pwdMin).trim().strict()
    .required(),
});

const applyResetPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase()
    .required(),
});

const resetPasswordSchema = Joi.object({
  password: Joi.string().min(pwdMin).trim().strict()
    .required(),
});

const signInSchema = Joi.object({
  email: Joi.string().email().trim().lowercase()
    .required(),
  password: Joi.string().min(pwdMin).trim().strict()
    .required(),
});

const createStudentLeaveSchema = Joi.object({
  student_id: Joi.number().integer().min(1).required(),
  leave_type_id: Joi.number().integer().min(1).required(),
  date: Joi.date().format(dateFormat).required(),
  start: Joi.string().regex(timeFormat).required(),
  end: Joi.string().regex(timeFormat).required(),
  hours: Joi.number().integer().min(0).max(24),
  approval: Joi.number().integer().min(0).max(2),
  reason: Joi.string().max(50).regex(prohibit, { invert: true }),
  note: Joi.string().max(50).regex(prohibit, { invert: true }),
  certificate_url: Joi.string(),
});

const editStudentLeaveSchema = Joi.object({
  student_id: Joi.number().integer().min(1),
  leave_type_id: Joi.number().integer().min(1),
  date: Joi.date().format(dateFormat),
  start: Joi.string().regex(timeFormat),
  end: Joi.string().regex(timeFormat),
  hours: Joi.number().integer().min(0).max(24),
  approval: Joi.number().integer().min(0).max(2),
  reason: Joi.string().max(50).regex(prohibit, { invert: true }),
  note: Joi.string().max(50).regex(prohibit, { invert: true }),
  certificate_url: Joi.string(),
});

const idSchema = Joi.object({
  id: Joi.number().integer().min(1).required(),
});

// only sensor server can punch, no need
// const punchSchema = Joi.object({
//   student_id: Joi.number().integer().min(1).required(),
// });

// audit leave may need

// middleware
const createClassType = async (req, res, next) => {
  const typeName = req.body.type_name;
  try {
    const classType = await createClassGroupTypeSchema.validateAsync({ name: typeName });
    res.locals.classType = classType;
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const createClassGroup = async (req, res, next) => {
  const groupName = req.body.group_name;
  try {
    const classGroup = await createClassGroupTypeSchema.validateAsync({ name: groupName });
    res.locals.classGroup = classGroup;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const createClassRoutine = async (req, res, next) => {
  const {
    class_type_id: classTypeId, weekday, start_time: startTime, end_time: endTime,
  } = req.body;
  const routine = {
    class_type_id: classTypeId, weekday, start_time: startTime, end_time: endTime,
  };
  try {
    const classRoutine = await createClassRoutineSchema.validateAsync(routine);
    res.locals.classRoutine = classRoutine;
    next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const editClassRoutine = async (req, res, next) => {
  const routine = req.body;
  const { id } = req.params;
  // remove empty key
  Object.keys(routine).forEach((key) => {
    if (routine[key] === undefined) {
      delete routine[key];
    }
  });

  try {
    const classRoutine = await editClassRoutineSchema.validateAsync(routine);
    const validId = await idSchema.validateAsync({ id });

    res.locals.classRoutine = classRoutine;
    res.locals.id = validId.id;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const createClass = async (req, res, next) => {
  const {
    class_type_id: classTypeId, batch, class_group_id: classGroupId,
    start_date: startDate, end_date: endDate,
  } = req.body;
  const clas = {
    class_type_id: classTypeId,
    batch,
    class_group_id: classGroupId,
    start_date: startDate,
    end_date: endDate,
  };
  try {
    const validClass = await createClassSchema.validateAsync(clas);
    res.locals.class = validClass;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const editClass = async (req, res, next) => {
  const clas = req.body;
  const { id } = req.params;
  if ((!clas.start_date && !clas.end_date) || (clas.start_date && clas.end_date)) {
    // remove empty key
    Object.keys(clas).forEach((key) => {
      if (clas[key] === undefined) {
        delete clas[key];
      }
    });

    try {
      const validClass = await editClassSchema.validateAsync(clas);
      const validId = await idSchema.validateAsync({ id });

      res.locals.clas = validClass;
      res.locals.id = validId.id;
      return next();
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: { message: error.details[0].message } });
    }
  }
  return res.status(400).json({ error: { message: 'start_date and end_date need to be provided together' } });
};

const createLeaveType = async (req, res, next) => {
  const leaveType = req.body;
  try {
    const validLeaveType = await createLeaveTypeSchema.validateAsync(leaveType);
    res.locals.leaveType = validLeaveType;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const createPunchException = async (req, res, next) => {
  const exception = req.body;
  try {
    const validException = await createPunchExceptionSchema.validateAsync(exception);
    res.locals.punchException = validException;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const createStudent = async (req, res, next) => {
  const student = req.body;
  try {
    const validStudent = await createStudentSchema.validateAsync(student);
    res.locals.student = validStudent;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const editStudent = async (req, res, next) => {
  const student = req.body;
  const { id } = req.params;

  // remove empty key
  Object.keys(student).forEach((key) => {
    if (student[key] === undefined) {
      delete student[key];
    }
  });

  try {
    const validStudent = await editStudentSchema.validateAsync(student);
    const validId = await idSchema.validateAsync({ id });

    res.locals.student = validStudent;
    res.locals.id = validId.id;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const createStaff = async (req, res, next) => {
  const staff = req.body;
  try {
    const validStaff = await createStaffSchema.validateAsync(staff);
    res.locals.staff = validStaff;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const changePassword = async (req, res, next) => {
  const passwords = req.body;
  try {
    const validPasswords = await changePasswordSchema.validateAsync(passwords);
    res.locals.passwords = validPasswords;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const applyResetPassword = async (req, res, next) => {
  const email = req.body;
  try {
    const validEmail = await applyResetPasswordSchema.validateAsync(email);
    res.locals.email = validEmail.email;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const resetPassword = async (req, res, next) => {
  const password = req.body;
  try {
    const validPassword = await resetPasswordSchema.validateAsync(password);
    res.locals.password = validPassword.password;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const signInInput = async (req, res, next) => {
  const signIn = req.body;
  try {
    const validSignIn = await signInSchema.validateAsync(signIn);
    res.locals.signIn = validSignIn;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const createStudentLeave = async (req, res, next) => {
  const studentId = req.params.id;
  const leave = req.body;
  leave.student_id = studentId;
  try {
    const validLeave = await createStudentLeaveSchema.validateAsync(leave);
    console.log(validLeave);
    res.locals.leave = validLeave;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

const editStudentLeave = async (req, res, next) => {
  const leave = req.body;
  const { id } = req.params;

  // remove empty key
  Object.keys(leave).forEach((key) => {
    if (leave[key] === undefined) {
      delete leave[key];
    }
  });

  try {
    const validLeave = await editStudentLeaveSchema.validateAsync(leave);
    const validId = await idSchema.validateAsync({ id });

    res.locals.leave = validLeave;
    res.locals.id = validId.id;
    return next();
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: { message: error.details[0].message } });
  }
};

module.exports = {
  createClassType,
  createClassGroup,
  createClassRoutine,
  editClassRoutine,
  createClass,
  editClass,
  createLeaveType,
  createPunchException,
  createStudent,
  editStudent,
  createStaff,
  changePassword,
  applyResetPassword,
  resetPassword,
  signInInput,
  createStudentLeave,
  editStudentLeave,
};
