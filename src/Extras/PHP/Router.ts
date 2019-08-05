import StringUtils from "../../StringUtils";
import * as vscode from 'vscode';
import EndPoint from "../Endpoint";

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
    private static getEndPointFromLine(line:string){
        //note this implmentation is for slim php, for the future more implmentations will be added
        //I put "get(" because is posible that there would be methods that include "get"  in their method name
        if( StringUtils.includesOr(line,['get(','post']) &&    
            StringUtils.includes(line,['(',')',';'])){
            let index=StringUtils.getIndexPluslengthOfFirst(line,['get','post']);
            let part=line.substr(index).trim();
            
            //As I know that eadither get or post exists I don't check that it is major than -1.

            //now I had removed the part until post or get, so I need to get The first paramter of the method, so I get the postion until the first ,
            part=part.substr(0,part.indexOf(','));
            part=part.substr(part.indexOf('(')+1);
            console.info(part);
            let endPoint= new EndPoint();
            endPoint.path=part;
            endPoint.method=StringUtils.getTextBetween('->','(',line);
            
            //Now I will try to get the method
            endPoint.name=StringUtils.getTextBetween(`:`,`')`,line);
            return endPoint;
        } 
        
        return null;
    }
}