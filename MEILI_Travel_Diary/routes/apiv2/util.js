
module.exports = {
  handleError: function(res, code, msg) {
    res.status(code);
    res.json({error: { code: code, msg: msg }});
    return res;
  }
}