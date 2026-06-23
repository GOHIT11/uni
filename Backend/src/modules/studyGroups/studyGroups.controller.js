/** @file studyGroups.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./studyGroups.service');

const create   = catchAsync(async (req, res) => { const r = await svc.create(req.body, req.user.email); sendSuccess(res, r, 'Study group created', 201); });
const getAll   = catchAsync(async (req, res) => { const r = await svc.getAll(req.query); sendSuccess(res, r, `Found ${r.length} groups`); });
const getById  = catchAsync(async (req, res) => { const r = await svc.getById(req.params.id); sendSuccess(res, r, 'Group fetched'); });
const join     = catchAsync(async (req, res) => { const r = await svc.join(req.params.id, req.user.email); sendSuccess(res, r, 'Joined group'); });
const message  = catchAsync(async (req, res) => {
  const r = await svc.sendMessage(req.params.id, req.user.email, req.body.content, req.body.fileUrl);
  const io = req.app.get('io');
  if (io) {
    io.to(req.params.id).emit('newMessage', r);
  }
  sendSuccess(res, r, 'Message sent', 201);
});

const leave = catchAsync(async (req, res) => {
  const g = await svc.getById(req.params.id);
  const email = req.user.email;
  const index = g.members.indexOf(email);
  if (index > -1) {
    g.members.splice(index, 1);
    await g.save();
  }
  sendSuccess(res, g, 'Left group');
});

const getMessages = catchAsync(async (req, res) => {
  const { GroupMessage } = require('./studyGroups.model');
  const messages = await GroupMessage.find({ groupId: req.params.id }).sort({ createdAt: 1 });
  sendSuccess(res, messages, 'Messages fetched');
});

module.exports = { create, getAll, getById, join, leave, message, getMessages };
