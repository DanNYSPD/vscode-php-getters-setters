import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import StringUtils from './StringUtils';
import DocumentModel from './Extras/DocumentModel';
export default class FunctionDefinition{

    name:string;
    numberLineBeginning:number;
    numberLineEnd:number;

    singleLineFunctionSignature:boolean;

    static getAllFunctionsNameFromAClassFile(content:string){
        let sep=DocumentModel.getNewLine(content);
       //let arrLines= content.split(os.EOL);
       let arrLines= content.split(sep);
       let arrayFunctionsNumberLines=[]; 
       for (let i = 0; i < arrLines.length; i++) {
           const element = arrLines[i];
           if(element.includes('function')){
                arrayFunctionsNumberLines.push(i)
           }
       }
       //now that i have all the number lines with functions declarations, I can filter those which have the declaration in one single line
       let functions:FunctionDefinition[]=[];
       for (let i = 0; i < arrayFunctionsNumberLines.length; i++) {
           const numberLine = arrayFunctionsNumberLines[i];
            //this is a basic comparison, if this line has parenthesis its means it is the whole function signature (a better aproach woould be indexof , an then comparing that "(" index is minor than ")" index and both are not negative)
           if(arrLines[numberLine].includes('(')&& arrLines[numberLine].includes(')')){
                //now i gona split by whitespaces
                let signatureParts=arrLines[numberLine].split(' ');
                let functionName=this.getFunctionNameSingleLine(arrLines[numberLine]);
                console.log(functionName);
                console.log(signatureParts);
                let functionDefinition= new FunctionDefinition();
                functionDefinition.name=functionName;
                functionDefinition.singleLineFunctionSignature=true;
                functionDefinition.numberLineBeginning=numberLine;
                functionDefinition.numberLineEnd=numberLine;
                functions.push(functionDefinition);
           }else {
               //multiline declaration
               // I will consider the signature end the nearest ")" after the reserved word function

           }
       }



       return functions;
    }

    static getFunctionNameSingleLine(str:string):string{
        return StringUtils.getTextBetween("function","(",str);

    }

    static getTemplateMethod(functionDef:FunctionDefinition,autoCall:string=null){
        const tab="\t";
        return ``+
        tab+`public function `+functionDef.name+`(`+``+`){`+`\n`+
        tab+``+(autoCall?tab+autoCall:``)+`\n`+
        tab+`}`+`\n`
        ;    
    }
}