const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const Advert = require('../models/Advert')
const User = require('../models/User')
const { check, validationResult } = require('express-validator')

// @Route           GET api/adverts
// @desc            Get all job adverts
// @access          Public Route
router.get('/', async (req, res) => {
	try {
		const adverts = await Advert.find()
		res.json(adverts)
	} catch (err) {
		console.log(err.message)
		res.status(500).send('Server Error')
	}
})

// @Route           POST api/adverts
// @desc            Post a job advert
// @access          Private Route
router.post(
	'/',
	[
		auth,
		[
			check('title', 'Job Title is required').not().isEmpty(),
			check('description', 'Description is required').not().isEmpty(),
			check('deadline', 'Deadline is required').not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req)
		if (!errors.isEmpty()) {
			return res.status(500).json({ errors: errors.array() })
		}
		const {
			company,
			title,
			description,
			salary,
			deadline,
			madeat,
			background,
			qualifications,
			responsibilities,
			skills,
			category,
			remarks,
		} = req.body

		try {
			const newAdvert = new Advert({
				user: req.user.id,
				company,
				title,
				description,
				salary,
				deadline,
				madeat,
				background,
				qualifications,
				responsibilities,
				skills,
				category,
				remarks,
			})

			const advert = await newAdvert.save()

			res.json(advert)
		} catch (err) {
			console.log(err.message)
			res.status(500).send('Server Error')
		}
	}
)

// @Route           DELETE api/adverts/:id
// @desc            Delete a job advert
// @access          Private Route
router.delete('/:id', auth, async (req, res) => {
	try {
		const advert = await Advert.findById(req.params.id)

		// Check if advert exists
		if (!advert) {
			return res.status(404).json({ msg: 'Advert does not exist' })
		}

		// Check if user deleting is the user who created
		if (req.user.id !== advert.user.toString()) {
			return res.status(401).json({ msg: 'User not authorized' })
		}

		await advert.remove()

		res.json({ msg: 'Advert Removed' })
	} catch (err) {
		console.log(err.message)
		res.status(500).send('Server Error')
	}
})

// @Route           GET api/adverts/:id
// @desc            Get a job advert by ID
// @access          Public
router.get('/:id', async (req, res) => {
	try {
		const advert = await Advert.findById(req.params.id)

		if (!advert) {
			return res.status(404).json({ msg: 'Advert does not exist' })
		}

		res.json(advert)
	} catch (err) {
		console.log(err.message)
		res.status(500).send('Server Error')
	}
})

// @Route           PUT api/adverts/:id
// @desc            Edit a job advert
// @access          Public
router.put('/:id', auth, async (req, res) => {
	const errors = validationResult(req)
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() })
	}
	const {
		company,
		title,
		description,
		salary,
		deadline,
		background,
		qualifications,
		responsibilities,
		skills,
		category,
		remarks,
	} = req.body

	// Build Advert Field
	const advertFields = {}
	if (company) advertFields.company = company
	if (title) advertFields.title = title
	if (description) advertFields.description = description
	if (salary) advertFields.salary = salary
	if (deadline) advertFields.deadline = deadline
	if (background) advertFields.background = background
	if (qualifications) advertFields.qualifications = qualifications
	if (responsibilities) advertFields.responsibilities = responsibilities
	if (skills) advertFields.skills = skills
	if (category) advertFields.category = category
	if (remarks) advertFields.remarks = remarks

	try {
		let advert = await Advert.findById(req.params.id)

		if (!advert) {
			return res.status(404).json({ msg: 'Advert not found' })
		}

		if (req.user.id !== advert.user.toString()) {
			return res.status(401).json({ msg: 'User not authorized' })
		}

		advert = await Advert.findByIdAndUpdate(
			req.params.id,
			{ $set: advertFields },
			{ new: true }
		)

		res.json(advert)
	} catch (err) {
		console.log(err.message)
		res.status(500).send('Server error')
	}
})

module.exports = router
