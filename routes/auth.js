const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { check, validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const config = require('config')
const bcrypt = require('bcryptjs')
const auth = require('../middleware/auth')

// @route       GET api/auth
// @desc        Get Logged in user
// @access      Private Route
router.get('/', auth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id).select('-password')
		res.json(user)
	} catch (err) {
		console.error(err.message)
		res.status(500).send('Server Error')
	}
})

// // @route       GET api/auth
// // @desc        Test route
// // @access      Public
// router.get('/', auth, async (req, res) => {
// 	try {
// 		const user = await User.findById(req.user.id).select('-password')
// 		res.json(user)
// 	} catch (err) {
// 		console.log(err.message)
// 		res.status(500).send('Server Error')
// 	}
// })

// @route       POST api/auth
// @desc        Authenticate a user & get token
// @access      Public
router.post(
	'/',
	// Validation of input fields when registering
	[
		check('email', 'Please include a valid email').isEmail(),
		check('password', 'Password is Required').not().isEmpty(),
	],
	// Returning an error if any of the inputs are wrong
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() })
		}
		// Destructure from body to avoid typing the same things over and over
		const { email, password } = req.body

		try {
			// See if user Exists
			let user = await User.findOne({ email })

			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] })
			}

			// Match the user with registered users

			const isMatch = await bcrypt.compare(password, user.password)

			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: 'Invalid Credentials' }] })
			}

			// Return jsonwebtoken

			const payload = {
				user: {
					id: user.id,
				},
			}

			jwt.sign(
				payload,
				config.get('jwtSecret'),
				{ expiresIn: 360000 },
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
