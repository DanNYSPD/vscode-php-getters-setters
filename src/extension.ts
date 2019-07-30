'use strict';

import * as vscode from 'vscode';
import Redirector from "./Redirector";
import Property from "./Property";
import Configuration from "./Configuration";
import TemplatesManager from './TemplatesManager';
import Constant from './Constant';
import Classe   from './Classe';
import DocumentUtils from './DocumentUtils';

//import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient'

class Resolver {
    config: Configuration;
    templatesManager: TemplatesManager;

    /**
     * Types that won't be recognised as valid type hints
     */
    pseudoTypes = ['mixed', 'number', 'callback', 'object', 'void'];

    public constructor()
    {
        const editor = this.activeEditor();

        if (editor.document.languageId !== 'php') {
            throw new Error('Not a PHP file.');
        }

        this.config = new Configuration;
        this.templatesManager = new TemplatesManager;
    }


      activeEditor() {
/*
        const conf = vscode.workspace.getConfiguration('php')
    const executablePath =
        conf.get<string>('executablePath') ||
        conf.get<string>('validate.executablePath') ||
        (process.platform === 'win32' ? 'php.exe' : 'php')

    const memoryLimit = conf.get<string>('memoryLimit') || '4095M'

    let client: LanguageClient*/

        //hasta aqui es lo que tenia por defecto
        return vscode.window.activeTextEditor;
    }

    closingClassLine() {
        const editor = this.activeEditor();
        //search starting by the last }, which in a PHP oriented style means that the last } is the end of class.
        for (let lineNumber = editor.document.lineCount - 1; lineNumber > 0; lineNumber--) {
            const line = editor.document.lineAt(lineNumber);
            const text = line.text.trim();

            if (text.startsWith('}')) {
                return line;
            }
        }

        return null;
    }

    insertGetter() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.getterTemplate(property);
        }

        this.renderTemplate(content);
    }

    insertGetterAndSetter(){
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.getterTemplate(property) + this.setterTemplate(property);
        }

        this.renderTemplate(content);
    }

    insertSetter() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];

            try {
                property = Property.fromEditorPosition(editor, selection.active);
            } catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }

            content += this.setterTemplate(property);
        }

        this.renderTemplate(content);
    }
    insertHasser() {
        const editor = this.activeEditor();
        let property = null;
        let content = '';
        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                property = Property.fromEditorPosition(editor, selection.active);
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            content += this.hasserTemplate(property);
        }
        this.renderTemplate(content);
    }
    insertIsConstant() {
        const editor = this.activeEditor();
        let constant = null;
        let content = '';
        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                constant = Constant.fromEditorPosition(editor, selection.active);
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            content += this.constantTemplate(constant);
        }
        this.renderTemplate(content);
    }
    constantTemplate(prop:Constant) {
        const name = prop.getName();
        const camelCaseName=Constant.toCamelCase(name);
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');
        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));
            return template(prop);
        }
        return (`\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.getDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @return` + spacesAfterReturn + type + `\n` : ``)
            + tab + ` */ \n`
            + tab + `public function is` + camelCaseName + `():bool\n`
            + tab + `{\n`
            //+ tab + tab + `return !empty($this->` + name + `);\n`
            + tab + tab + `return self::`+prop.getName()  + `==;\n`
            + tab + `}\n`);
    }
    hasserTemplate(prop) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');
        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));
            return template(prop);
        }
        return (`\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.hasserDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @return` + spacesAfterReturn + type + `\n` : ``)
            + tab + ` */ \n`
            + tab + `public function ` + prop.hasserName() + `():bool\n`
            + tab + `{\n`
            + tab + tab + `return !empty($this->` + name + `);\n`
            + tab + `}\n`);
    }

    getterTemplate(prop: Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');
        const templateFile = this.config.get('getterTemplate', 'getter.js');

        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));

            return template(prop);
        }

        return  (
            `\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.getterDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @return` + spacesAfterReturn + type + `\n` : ``)
            + tab + ` */\n`
            + tab + `public function ` + prop.getterName() + `()\n`
            + tab + `{\n`
            + tab + tab + `return $this->` + name + `;\n`
            + tab + `}\n`
        );
    }

    setterTemplate(prop: Property) {
        const name = prop.getName();
        const description = prop.getDescription();
        const tab = prop.getIndentation();
        const type = prop.getType();
        const typeHint = prop.getTypeHint();
        const spacesAfterParam = Array(this.config.getInt('spacesAfterParam', 2) + 1).join(' ');
        const spacesAfterParamVar = Array(this.config.getInt('spacesAfterParamVar', 2) + 1).join(' ');
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');

        const templateFile = this.config.get('setterTemplate', 'setter.js');

        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));

            return template(prop);
        }

        return (
            `\n`
            + tab + `/**\n`
            + tab + ` * ` + prop.setterDescription() + `\n`
            + (type ? tab + ` *\n` : ``)
            + (type ? tab + ` * @param` + spacesAfterParam + type + spacesAfterParamVar + `$` + name + (description ? `  ` + description : ``) + `\n` : ``)
            + tab + ` *\n`
            + tab + ` * @return` + spacesAfterReturn + `self\n`
            + tab + ` */\n`
            + tab + `public function ` + prop.setterName() + `(` + (typeHint ? typeHint + ` ` : ``) + `$` + name + `)\n`
            + tab+ `{\n`
            + tab + tab + `$this->` + name + ` = $` + name + `;\n`
            + `\n`
            + tab + tab + `return $this;\n`
            + tab + `}\n`
        );
    }
    insertClass() {
        const editor = this.activeEditor();
        let classe = null;
        let content = '';
        let name=editor.document.fileName;
        let line1=editor.document.lineAt(0);
         

        for (let index = 0; index < editor.selections.length; index++) {
            const selection = editor.selections[index];
            try {
                classe =new Classe();
                classe.name=name;
                if(line1.isEmptyOrWhitespace){
                    classe.setIncludePhpTag(true);
                }
            }
            catch (error) {
                this.showErrorMessage(error.message);
                return null;
            }
            content += this.classTemplate(classe);
        }
        this.renderTemplate(content);
    }
    classTemplate(classe:Classe){
     
       const tab='\t';
        const spacesAfterParam = Array(this.config.getInt('spacesAfterParam', 2) + 1).join(' ');
        const spacesAfterParamVar = Array(this.config.getInt('spacesAfterParamVar', 2) + 1).join(' ');
        const spacesAfterReturn = Array(this.config.getInt('spacesAfterReturn', 2) + 1).join(' ');

        const templateFile = this.config.get('setterTemplate', 'setter.js');

        if (this.templatesManager.exists(templateFile)) {
            const template = require(this.templatesManager.path(templateFile));

            return template(classe);
        }
        return (
            `\n`
            + tab + (classe.includePhpTag?`<?`:``)
            +`\n`
            + tab + `/**\n`
            + tab + ` *\n`
            + tab + ` *\n`
            + tab + ` **/\n`
            + tab + `  class ` + classe.getSimpleName() + `{\n`
           
            + `\n`            
            + tab 
            + `}\n`
        );
        
    }
    insertConstructorProperties(){
        const editor = this.activeEditor();

        editor.document.lineCount
        var i=0;
        var constructorFounded;
        var lstparameters:string[]=[];

        var lineConstructorNumber=-1;
        while(constructorFounded!=true){
            var line=editor.document.lineAt(i);

            if(line.text.includes("__construct")){
                lineConstructorNumber=i;
                constructorFounded=true;
               var constructArr= line.text.split("__construct");
              const parameters= constructArr[1].trim() ;//contendria los parametros
                if(parameters.includes('(')&&parameters.includes(')')){
                    //this means that the constuctor signature is in one single line.
                    let beginning=parameters.indexOf('(')+1;
                    let last=parameters.indexOf(')');
                    lstparameters=parameters.substr(beginning,last-beginning).split(',');


                }else{
                    ///for the next phase (in case that the constructor signature is multiline)
                }

            }

            i++;
        }
        //I get the propierties
        let lstProperties=  Property.getProperties(editor.document);
        //now I process the paramters list
        var lstparametersObj:Property[]=[];
        lstparameters.forEach(element => {
            element=element.trim();
            var ind=element.indexOf(' ')//i will search if there is a space (this means that there is two words, so there is a type and a name)
            if(ind>=0){
                var eles=element.split(' ');
                var p= new Property(eles[1].substr(1)); //removes the $ symbol
                p.setType(eles[0])
                lstparametersObj.push(p);
            }else{
                lstparametersObj.push(new Property(element.substr(1)));//removes the $ symbol
            }
        });
      

        let template='';
        lstparametersObj.forEach(element => {
            if(lstProperties.find(x=>x==element.getName())){
                return;
            }

           const tab='\t';

           template+=
            tab+ `/**\n`+
            tab +`*\n`+
            tab+`*`+(element.getType()?` @var `+element.getType():``)+`\n`+
            tab+`*/\n`+
            tab+`public $`+element.getName()+`;`+
            tab+`\n`;
           
        });



        let constructorBodybegining=DocumentUtils.searchFirts('{',lineConstructorNumber,editor.document)
        let constructorBodyEnd=DocumentUtils.searchFirts('}',constructorBodybegining,editor.document)
        let listPropertiesInConstructorThatAreClassProperties=Property.getPropertiesInsideFunctionThatAreClassProperties(constructorBodybegining,constructorBodyEnd,editor.document);

        let templateAsingation='';
        lstparametersObj.forEach(element=>{

            if(listPropertiesInConstructorThatAreClassProperties.find(x=>x==element.getName())){
                return;
            }

           const tab='\t';
           templateAsingation+=''+
           tab+` $this->`+element.getName()+`=$`+element.getName()+`;`+`\n`
           tab+`\n`;
          
       });
       if(!template){
           template='';
       }
       this.renderTemplate(template).then(success=>{
            this.renderTemplate(templateAsingation,constructorBodybegining+1);
       })
    }

    renderTemplate(template: string,lineNumber?:number) {
        if (!template) {
            this.showErrorMessage('Missing template to render.');
            return;
        }
        if(!lineNumber){
            let insertLine = this.insertLine();
            
            if (!insertLine) {
                this.showErrorMessage('Unable to detect insert line for template.');
                return;
            }
            lineNumber=insertLine.lineNumber;
        }
        const editor = this.activeEditor();
        let resolver = this;

     return   editor.edit(function(edit: vscode.TextEditorEdit){
            edit.replace(
                new vscode.Position(lineNumber, 0),
                template
            );
        }).then(
            success => {
                if (resolver.isRedirectEnabled() && success) {
                    const redirector = new Redirector(editor);
                    //redirector.goToLine(this.closingClassLine().lineNumber - 1);
                    redirector.goToLine(lineNumber);
                }
            },
            error => {
                this.showErrorMessage(`Error generating functions: ` + error);
            }
        );
        
    }

    insertLine() {
        return this.closingClassLine();
    }

    isRedirectEnabled() : boolean {
        return true === this.config.get('redirect', true);
    }

    showErrorMessage(message: string) {
        message = 'phpGettersSetters error: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showErrorMessage(message);
    }

    showInformationMessage(message: string) {
        message = 'phpGettersSetters info: ' + message.replace(/\$\(.+?\)\s\s/, '');

        vscode.window.showInformationMessage(message);
    }
}

function activate(context: vscode.ExtensionContext) {
    let resolver = new Resolver;

    let insertGetter = vscode.commands.registerCommand('phpGettersSetters.insertGetter', () => resolver.insertGetter());
    let insertSetter = vscode.commands.registerCommand('phpGettersSetters.insertSetter', () => resolver.insertSetter());
    let insertGetterAndSetter = vscode.commands.registerCommand('phpGettersSetters.insertGetterAndSetter', () => resolver.insertGetterAndSetter());
    let insertHasser = vscode.commands.registerCommand('phpGettersSetters.insertHasser', () => resolver.insertHasser());
    let insertIsConstant = vscode.commands.registerCommand('phpGettersSetters.insertIsConstant', () => resolver.insertIsConstant());
    let insertClass = vscode.commands.registerCommand('phpGettersSetters.insertClass', () => resolver.insertClass());
    let insertConstructorProperties = vscode.commands.registerCommand('phpGettersSetters.insertConstructorProperties', () => resolver.insertConstructorProperties());

    context.subscriptions.push(insertGetter);
    context.subscriptions.push(insertSetter);
    context.subscriptions.push(insertGetterAndSetter);
	context.subscriptions.push(insertHasser);
    context.subscriptions.push(insertClass);
    

	context.subscriptions.push(insertConstructorProperties);

}

function deactivate() {
}

exports.activate = activate;
exports.deactivate = deactivate;
