const mongoose = require('mongoose')
const { Schema } = mongoose

const AdvertSchema = new Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'user',
	},
	company: {
		type: String,
	},
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	salary: {
		type: String,
	},
	deadline: {
		type: Date,
		required: true,
	},
	madeat: {
		type: Date,
		default: Date.now(),
	},
	background: {
		type: String,
	},
	qualifications: [
		{
			type: String,
		},
	],
	responsibilities: [
		{
			type: String,
		},
	],
	skills: [
		{
			type: String,
		},
	],
	category: {
		type: String,
	},
	remarks: {
		type: String,
	},
})

module.exports = Advert = mongoose.model('advert', AdvertSchema)
