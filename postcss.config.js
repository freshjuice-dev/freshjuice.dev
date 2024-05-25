module.exports = {
	plugins: [
		require("postcss-easy-import"),
		require("postcss-discard-comments")({removeAll: true}),
		require("tailwindcss/nesting"),
		require("tailwindcss"),
		require("autoprefixer"),
		require("postcss-merge-rules")
	],
};
