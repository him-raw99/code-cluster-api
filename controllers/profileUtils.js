export const getProfile = (req, res) => {
  res.json({
    email: req.user.email,
    username: req.user.username,
    viewCount: req.user.viewCount,
    success: true,
  });
};
