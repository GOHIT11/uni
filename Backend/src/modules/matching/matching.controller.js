/** @file matching.controller.js */
const catchAsync = require('../../middleware/catchAsync');
const { sendSuccess } = require('../../shared/responses/apiResponse');
const svc = require('./matching.service');

const create  = catchAsync(async (req, res) => { const r = await svc.create(req.body, req.user.email); sendSuccess(res, r, 'Match request created', 201); });
const getAll  = catchAsync(async (req, res) => { const r = await svc.getAll(req.query); sendSuccess(res, r, `Found ${r.length} requests`); });
const getById = catchAsync(async (req, res) => { const r = await svc.getById(req.params.id); sendSuccess(res, r, 'Request fetched'); });
const match   = catchAsync(async (req, res) => {
  const r = await svc.matchUser(req.params.id, req.user.email);

  const io = req.app.get('io');
  if (io) {
    const { sendInAppNotification } = require('../../shared/notificationService');
    await sendInAppNotification(r.requestedBy, 'teammate_request', `${req.user.fullName || req.user.email} wants to team up`, { requestId: r._id });
    // Assuming a simple mapping or just emitting to personal room if implemented
  }

  sendSuccess(res, r, 'Match submitted');
});
const close   = catchAsync(async (req, res) => { const r = await svc.close(req.params.id, req.user.email); sendSuccess(res, r, 'Request closed'); });

module.exports = { create, getAll, getById, match, close };
