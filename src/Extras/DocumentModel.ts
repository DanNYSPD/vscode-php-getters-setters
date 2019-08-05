import { TextDocument } from "vscode";

export default class DocumentModel {
    arrLines:string[];

    
    fileName: string;
    lineCount:number;
    lineAt(position: any):string {
     return this.arrLines[position];
    }
    

    static createFromText(content){
        const newLine=this.getNewLine(content);
        let arrLines= content.split(newLine);
        let doc= new DocumentModel();
        doc.arrLines=arrLines;
        doc.lineCount=arrLines.length;
    }


    static getNewLine(content:string):string{
        //I cannot trust in newLine from the os , for example, when git manage o replaces this
        let newLine="";
        if(content.includes('\r\n')){
            
            newLine='\r\n';
        }else if(content.includes('\n')){
            
            newLine='\n';
        }
        return newLine; 
    }    
}