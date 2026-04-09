const validate = (schema) => (req, res, next) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (e) {
        return res.status(400).json({
            success: false,
            message: "Validation Error",
            errors: e.errors.map(err => ({
                path: err.path[1], // body.field -> field
                message: err.message
            }))
        });
    }
};

export default validate;
