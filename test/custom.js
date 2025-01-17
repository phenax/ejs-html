/*globals describe, it*/
'use strict'

let compile = require('..').compile
require('should')

describe('custom', function () {
	let renderDialog
	it('should compile custom tag definition', function () {
		renderDialog = compile(`<div class="dialog">
	<div class="dialog-title">
		<%= title %>
		<% if (closable) { %>
			<div class="dialog-close">X</div>
		<% } %>
	</div>
	<eh-placeholder>
		<!-- dialog content goes here -->
	</eh-placeholder>
	<div class="dialog-buttons">
		<button class="dialog-yes">Yes</button>
		<button class="dialog-no">No</button>
	</div>
</div>`)
	})

	let renderView
	it('should compile custom tag usage', function () {
		renderView = compile(`<custom-dialog title="Wanna Know?" closable>
	<em>HTML</em> Content
</custom-dialog>`)
	})

	it('should render custom tags', function () {
		renderView({}, (name, locals) => {
			name.should.be.equal('custom-dialog')
			locals.should.be.eql({
				title: 'Wanna Know?',
				closable: true,
				__contents: {
					'': '\n<em>HTML</em> Content\n'
				}
			})
			return renderDialog(locals)
		}).should.be.equal(`<div class=dialog>
<div class=dialog-title>
Wanna Know?
<div class=dialog-close>X</div>
</div>

<em>HTML</em> Content

<div class=dialog-buttons>
<button class=dialog-yes>Yes</button>
<button class=dialog-no>No</button>
</div>
</div>`)
	})

	it('should support multiple and named placeholders', function () {
		check(`<eh-placeholder></eh-placeholder>
<eh-placeholder name="a"></eh-placeholder>
<eh-placeholder></eh-placeholder>
<eh-placeholder name="a"></eh-placeholder>`, `<my-tag>
outside
<eh-content name="a">inside</eh-content>
</my-tag>`, `
outside

inside

outside

inside`)
	})

	it('should allow passing complex JS values', function () {
		let myObj = {}
		compile('<my-tag ref="<%=someObj%>"></my-tag>')({
			someObj: myObj
		}, (_, locals) => {
			locals.ref.should.be.equal(myObj)
		})
	})

	it('should use default placeholder when no content is provided', function () {
		check('<eh-placeholder>default</eh-placeholder>', '<my-tag></my-tag>', 'default')
		check('<eh-placeholder>default</eh-placeholder>', '<my-tag>\n</my-tag>', 'default')
		check('<eh-placeholder>default</eh-placeholder>', '<my-tag> </my-tag>', 'default')
		check('<eh-placeholder>default</eh-placeholder>', '<my-tag>x</my-tag>', 'x')
	})

	it('should not treat any boolean-like attribute as true', function () {
		check('<%=bool%>', '<my-tag bool></my-tag>', 'true')
	})

	it('should turn dash notation to camel case', function () {
		check('<%=userName%>', '<my-tag user-name=gui></my-tag>', 'gui')
	})
})

function check(customSource, source, expected) {
	compile(source)({}, (_, locals) => compile(customSource)(locals)).should.be.equal(expected)
}