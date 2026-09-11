import jwt from "jsonwebtoken";

export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication required" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      message: "Invalid authorization header",
    });
  }
  try {
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET)
      throw new Error("JWT_SECRET is missing");
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = (decoded as any).userId;
    next();
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
}