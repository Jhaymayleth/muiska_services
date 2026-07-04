export const getStatus = (_req, res) => {
  res.json({
    status: "ok",
    message: "Backend MUISKA funcionando",
  });
};
