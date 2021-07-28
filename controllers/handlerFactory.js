/******************************************************
 *
 * *Handler factory for creating functions to
 * *handle CRUD options within the database
 *
 *****************************************************/

const catchAsync = require('../util/catchAsync');
const APIFeatures = require('../util/APIFeatures');

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    const filter = {};
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .paginate();
    const doc = await features.query;
    res.status(200).json({
      status: 'success',
      results: doc.length,
      data: {
        data: doc,
      },
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.find({ slug: req.params.slug });
    if (popOptions) query = query.populate(popOptions);

    const doc = await query;
    if (!doc)
      return res.status(404).json({
        status: 'failed',
        data: { message: 'could not find document!' },
      });
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.deleteOne({ slug: req.params.slug });
    res.status(204).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        doc,
      },
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const updateObject = req.body;
    const doc = await Model.findOneAndUpdate(
      { slug: req.params.slug },
      { $set: updateObject },
      { new: true, runValidators: true }
    );
    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
