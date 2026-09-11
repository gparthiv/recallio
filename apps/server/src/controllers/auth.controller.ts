import bcrypt from "bcrypt";
import { User } from "../models/Schemas.js";
import jwt from "jsonwebtoken";
import { signupSchema, signinSchema } from "../validations/auth.validation.js";

export async function signup(req: any, res: any): Promise<any> {
  try {
    // 1. Validate request body
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        message: "Invalid Credential",
        errors: result.error.issues[0]?.message
      });
    }
    // 2. Get validated data
    const { username, password } = result.data;

    // 4. Hash da password
    const hashedPassword = await bcrypt.hash(password, 10);
    // 5. Create da user
    const newUser = await User.create({
      username,
      password: hashedPassword,
    });

    // 6. Send da response
    res
      .status(201)
      .json({ message: "User created successfully" });

  } catch (err: any) {
    // Check if username already exists
    if (err.code === 11000)
      return res.status(409).json({ message: "Username already exists" });
    console.error("Signup error details:", err.message);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

export async function signin(req: any, res: any): Promise<any> {
  try {
    const result = signinSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({
          message: "Invalid credentials",
          errors: result.error.issues[0]?.message,
        });
    }
    const { username, password } = result.data;
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid user" });
    }

    const passwordMatch = await bcrypt.compare(
      password, user.password
    );
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid username or password" });
    }
    if (!process.env.JWT_SECRET)
      throw new Error("JWT_SECRET is missing");
    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET);

    return res.status(200).json({
      message: "Signin successful",
      token,
    });
  } catch (error: any) {
    console.error("Signin error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}