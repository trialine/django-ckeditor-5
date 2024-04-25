import { ButtonView, addToolbarToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui'
import { Command, Plugin } from '@ckeditor/ckeditor5-core'
import { Widget, toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget'




class Template extends Plugin {
    static get pluginName() {
        return 'Template'
    }
    static get requires() {
        return [TemplateEditing, TemplateUI]
    }
}




class TemplateUI extends Plugin {
    init() {
        if (window.CK_EDITOR_TEMPLATES && window.CK_EDITOR_TEMPLATES.length) {
            const editor = this.editor
            editor.ui.componentFactory.add('template', locale => {
                // The state of the button will be bound to the widget command.
                const command = editor.commands.get('insertTemplate')

                const buttons = []

                window.CK_EDITOR_TEMPLATES.forEach(buttonInfo => {
                    const button = this._createButton(buttonInfo.label, buttonInfo.html, buttonInfo.icon)
                    buttons.push(button)
                })
                const dropdownView = createDropdown(locale)
                dropdownView.buttonView.set({
                    withText: true,
                    label: 'Insert Template',
                })
                dropdownView.bind('isOn', 'isEnabled').to(command, 'value', 'isEnabled')
                addToolbarToDropdown(dropdownView, buttons)
                dropdownView.render()
                return dropdownView
            })
        }
    }

    _createButton(label, html, icon = null) {
        const button = new ButtonView()
        button.set({
            label: label,
            withText: true,
            icon: icon
        })
        button.on('execute', () => {
            // Change the model using the model writer.
            this.editor.execute('insertTemplate', html)
        })
        return button
    }

}

class TemplateEditing extends Plugin {
    static get requires() {
        return [Widget]
    }

    init() {
        this._defineSchema()
        this._defineConverters()
        this.editor.commands.add('insertTemplate', new InsertTemplateCommand(this.editor))
    }

    _defineSchema() {
        const schema = this.editor.model.schema
        schema.register('div', {
            inheritAllFrom: '$blockObject',
            allowContentOf: '$root'
        })
        schema.extend('div', {
            allowAttributes: ['class']
        })
    }

    _defineConverters() {
        const conversion = this.editor.conversion
        conversion.for('upcast').elementToElement({
            view: 'div',
            model: (viewElement, {
                writer: modelWriter
            }) => {
                const viewAttributes = Array.from(viewElement.getAttributes())
                const modelAttributes = {}
                for (const [key, value] of viewAttributes) {
                    modelAttributes[key] = value
                }
                return modelWriter.createElement('div', modelAttributes)
            }
        })

        conversion.for('dataDowncast').elementToElement({
            model: 'div',
            view: (modelElement, {
                writer: viewWriter
            }) => {
                const attributes = Array.from(modelElement.getAttributes())
                const divAttributes = Object.fromEntries(attributes)

                return viewWriter.createContainerElement('div', divAttributes)
            }
        })

        conversion.for('editingDowncast').elementToElement({
            model: 'div',
            view: (modelElement, {
                writer: viewWriter
            }) => {
                const attributes = Array.from(modelElement.getAttributes())
                const divAttributes = Object.fromEntries(attributes)

                const section = viewWriter.createEditableElement('div', divAttributes)
                if (divAttributes.class && divAttributes.class.includes('ck-wrap-widget')) {
                    return toWidget(section, viewWriter, {
                        label: 'div widget'
                    })
                }
                return toWidgetEditable(section, viewWriter, {
                    label: 'div widget'
                })
            }
        })

    }
}

class InsertTemplateCommand extends Command {
    execute(html) {
        this.editor.model.change(_ => {
            insertTemplate(this.editor, html)
        })
    }

    refresh() {
        const model = this.editor.model
        const selection = model.document.selection
        const allowedIn = model.schema.findAllowedParent(selection.getFirstPosition(), 'div')
        this.isEnabled = allowedIn !== null
    }
}

function insertTemplate(editor, html) {
    const viewFragment = editor.data.processor.toView(html)
    const modelFragment = editor.data.toModel(viewFragment)
    editor.model.insertContent(modelFragment)
    return modelFragment
}


export default Template
