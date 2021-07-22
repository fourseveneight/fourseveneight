exports.getAll = (Model)=>
    async(req, res, next)=>{
        const doc = await Model.find();
        res.status(200).json({
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            }
        })
    }
