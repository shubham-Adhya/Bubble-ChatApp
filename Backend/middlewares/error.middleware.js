function notFound(req, res, next) {
    const error=new Error(`Not Found - ${req.url}`)
    return res.status(404).json({
        error: error.message
    })
}

module.exports = {
    notFound, 
}