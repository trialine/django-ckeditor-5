import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { ButtonView, SplitButtonView, addToolbarToDropdown, createDropdown, } from '@ckeditor/ckeditor5-ui';




class Template extends Plugin {
    static get pluginName() {
        return 'Template';
    }
    init() {
        if(window.CK_EDITOR_TEMPLATES && window.CK_EDITOR_TEMPLATES.length){
            const editor = this.editor;
            // const dropdown = this._createDropdown();

            editor.ui.componentFactory.add('template', () => {
                const locale = editor.locale;
                const buttons = [];

                window.CK_EDITOR_TEMPLATES.forEach(buttonInfo => {
                    const button = this._createButton(buttonInfo.label, buttonInfo.html, buttonInfo.icon);
                    buttons.push(button);
                });
                const dropdownView = createDropdown( locale );
                dropdownView.buttonView.set({
                    withText: true,
                    label: 'Insert Template',
                });
                addToolbarToDropdown( dropdownView, buttons );

                dropdownView.render();
                return dropdownView;
            });
        }
        return
    }

    _createButton(label, html, icon = null) {
        const button = new ButtonView();
        button.set({
            label: label,
            withText: true,
            icon: icon
        });
        button.on('execute', () => {
            // Change the model using the model writer.
            this.editor.model.change(() => {

                // Insert the HTML at the user's current position.
                const viewFragment = this.editor.data.processor.toView(html);
                const modelFragment = this.editor.data.toModel(viewFragment);

                this.editor.model.insertContent(modelFragment);
            });
        });
        return button;
    }
}

export default Template;
