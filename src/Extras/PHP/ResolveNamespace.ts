
import StringUtils from "../../StringUtils";
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import Composer from "../../Composer";
import PathUtils from "../../PathUtils";

export default class ResolveNamespace{

    static hasNamespace(className:string ):boolean{
        return className.includes("\\")
        
    }

    static resolveNamePsr4(folderModule:string,absolutePath:boolean=false){
        //according to the debug message "workspace.rootPath' is deprecated", so i shuld use workspaceFolders[0] , index 0.
        let composerFileName=path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'composer.json');//https://code.visualstudio.com/api/references/vscode-api#workspace
        let composer=null;
        if(fs.existsSync(composerFileName)){
            let rawdata = fs.readFileSync(composerFileName,'utf8');
            composer = JSON.parse(rawdata);
        }
        //if not ends with \, this means is a full classname instead of just namespaces so
        let className='';
        if(!folderModule.endsWith("\\")){
           let indexLast= folderModule.lastIndexOf("\\")
           //firts I retrieved the class Name;
           className=folderModule.substr(indexLast,folderModule.length-indexLast);
           folderModule =folderModule.substr(0,indexLast);
           
        }
        let ComposerObj= new Composer(composer);
        let resolvedNamespace='';
        if(composer && ComposerObj.hasPSR4()){
            //debo remover la parte del root 
            let root=vscode.workspace.workspaceFolders[0].uri.fsPath;
            
            let indexTheyDiffer=PathUtils.getIndexOfDifference(root,folderModule);
            let subfolder=folderModule.substr(indexTheyDiffer);
            resolvedNamespace= ComposerObj.getFileFromNamespace(subfolder);
            let resolvedPath=path.join(resolvedNamespace,className);
            if(absolutePath){
               return  path.join(root,resolvedPath);
            }
            return resolvedPath;
        
        }

    }

}