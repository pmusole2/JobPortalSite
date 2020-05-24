const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')

// @Route       POST /api/users
// @desc        Register a new User
// @access      Public
router.post(
	'/',
	[
		// Server Side Validation on the register input fields
		check('name', 'Please enter the name field').not().isEmpty(),
		check(
			'email',
			'Email is required for Registration. Please enter a valid email'
		).isEmail(),
		check(
			'password',
			'Enter a password with Six (6) or more characters'
		).isLength({ min: 6 }),
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}

		const { name, email, password } = req.body

		try {
			// Check if email exists
			let user = await User.findOne({ email })

			// Check if Email Address is taken
			if (user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'User already exists' }] })
			}

			// create instance of new user
			user = new User({
				name,
				email,
				password,
			})

			// Encrypt Password
			const salt = await bcrypt.genSalt(10)

			user.password = await bcrypt.hash(password, salt)

			await user.save()

			const payload = {
				user: {
					id: user.id,
				},
			}
			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{
					expiresIn: 360000,
				},
				(err, token) => {
					if (err) throw err
					res.json({ token })
				}
			)
		} catch (err) {
			console.error(err)
			res.status(500).send('Server Error')
		}
	}
)

module.exports = router
