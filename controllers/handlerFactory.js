/******************************************************
 *
 * *Handler factory for creating functions to
 * *handle CRUD options within the database
 *
 *****************************************************/

exports.getAll = (Model) => async (req, res, next) => {
  const doc = await Model.find();
  res.status(200).json({
    status: "success",
    results: doc.length,
    data: {
      data: doc,
    },
  });
};

exports.getOne = (Model) => async (req, res, next) => {
  let query = Model.find({ slug: req.params.slug });
  const doc = await query;
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
};

exports.deleteOne = (Model) => async (req, res, next) => {
  const doc = await Model.deleteOne({ slug: req.params.slug });
  res.status(204).json({
    status: "success",
    data: {
      data: doc,
    },
  });
};

exports.createOne = (Model) => async (req, res, next) => {
  const doc = await Model.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      doc,
    },
  });
};

exports.updateOne = (Model) => async (req, res, next) => {
  let updateObject = req.body;
  const doc = await Model.findOneAndUpdate(
    { slug: req.params.slug },
    { $set: updateObject },
    { new: true, runValidators: true }
  );
  res.status(200).json({
    status: "success",
    data: {
      data: doc,
    },
  });
};
