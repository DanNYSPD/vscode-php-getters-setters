import StringUtils from "../../StringUtils";
import * as vscode from 'vscode';
import EndPoint from "../Endpoint";
import DocumentModel from "../DocumentModel";

export default class Router{


    static readRoutes(document:vscode.TextDocument){
           //leer cada linea, si contiene post,get, group con "(" ")" y  ";" entonces es una linea completa
        
        let i=0;
        let endPoints:EndPoint[]=[];
        while(i<document.lineCount){
            let endPoint=this.getEndPointFromLine(document.lineAt(i).text);
            if(endPoint!=null){
                endPoints.push(endPoint);
            }
            i++;
        }
        return endPoints;
    }
    private static getEndPointFromLine(line:string,readController:boolean=false){
        //note this implmentation is for slim php, for the future more implmentations will be added
        //I put "get(" because is posible that there would be methods that include "get"  in their method name
        if( StringUtils.includesOr(line,['get(','post']) &&    
            StringUtils.includes(line,['(',')',';'])){
            line=line.trim()    
            if(StringUtils.startsWithOr(line,['#','//','/*'])){
                // is a comment !!, ignore! (note: this doesn't consider multiline comments)
                return null;
            }
            

            let indexWithLength=StringUtils.getIndexPluslengthOfFirst(line,['get(','post(']);
            let part=line.substr(indexWithLength).trim();
            
            //As I know that eadither get or post exists I don't check that it is major than -1.

            //now I had removed the part until post or get, so I need to get The first paramter of the method, so I get the postion until the first ,
            part=part.substr(0,part.indexOf(','));
           // part=part.substr(part.indexOf('(')+1);
            console.info(part);
            let endPoint= new EndPoint();
            endPoint.path=part;
            endPoint.method=StringUtils.getTextBetween('->','(',line);
            
            //Now I will try to get the method
            endPoint.name=StringUtils.getTextBetween(`:`,`')`,line);

            if(readController){
                // the paths walsway have the next forms  
                
                /**
                 * "$router=  $app->post('/VerificarVale', ValeModuleController::class.':VerificarVale');"
                 * "$app->post('/VerificarVale', ValeModuleController::class.':VerificarVale');"
                 * "$app->post('/VerificarVale', "ValeModuleController".':VerificarVale');"
                 */

                 //is posible to to define a function on it but is not good and is not my way, so I won't consider it
                 let controllerPart='';
                if(line.includes('::')){
                    controllerPart= StringUtils.getTextBetween(',','::',line);
                }else{
                 controllerPart= StringUtils.getTextBetween(',',':',line);
                    controllerPart= controllerPart.substr(1,controllerPart.length-4)// here i remove foru characters that are `"` (end of string paramtere) `.`(concatation) `'` (start of method string pararmaters)
                }
                endPoint.controllerClassName=controllerPart;

                //Now I get that method name
                let beginingMethod=line.lastIndexOf(':');
                let endMethod=line.lastIndexOf(')');
                let methodName= line.substr(beginingMethod+1,endMethod-beginingMethod-2); //minus 2, becasuse i want to removr the two characters `)` and `'` (or `"`)
                //methodName.
                endPoint.controllerClassMethod=methodName;
            }
            return endPoint;
        } 
        
        return null;
    }
    static readFromFile(content:string):EndPoint[]{
        let sep=DocumentModel.getNewLine(content);
       //let arrLines= content.split(os.EOL);
       let arrLines= content.split(sep);
       let endPoints=[]; 
       for (let i = 0; i < arrLines.length; i++) {
        let endPoint=this.getEndPointFromLine(arrLines[i],true);
        if(endPoint!=null){
            endPoint.numberLine=i;//number line where the path was founded (not the controller linenumber)

            endPoints.push(endPoint);
        }
       }
       return endPoints;
    }
}