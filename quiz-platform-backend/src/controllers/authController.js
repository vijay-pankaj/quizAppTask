import authService from "../services/authService.js"

const login = async (req, res) => {

    try {

        const result = await authService.login(req.body)

        res.status(200).json({
            success: true,
            token: result.token,
            user: result.user
        })

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        })

    }
}

export default {
    login
}