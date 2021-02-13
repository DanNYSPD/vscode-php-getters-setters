
import StringUtils from "../../StringUtils";
import {window,TextEditor}  from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import Composer from "../../Composer";
import PathUtils from "../../PathUtils";
import Property from "../../Property";
/**
 * As a Developer I want to be able to select one by one every property on the current 
 * class file so that I can create a construct from that list automatically increasing my speed
 */
export default class CreateConstructorFromProperties{
    /**
     * Generate the constructor function signature(arguments)
     * @param properties 
     */
    static createFunctionSignature(properties:Property[]):string{
        let temp='';
        properties.forEach(p=> {
                if(temp.length>0){
                    temp+=","
                }
                if(p.hasType()){
                    temp+=p.getType()+" ";
                }
                temp+= "$"+p.getName()
            }
        );
        return temp;
    }
    /**
     * Generates the constructor body assigments
     * @param properties 
     */
    static insertAssigmentInsideConstructor(properties:Property[]){

        let assignement='';
        properties.forEach(function (p){
            //double identation because is inside of a function
            assignement+=p.getIndentation()+p.getIndentation()+ "$this->"+p.getName()+"=$"+p.getName()+";\n";
        })
        return assignement;
    }
    
    static createConstructorFromPropeties(editor:TextEditor):string{
        //TODO: Show A list of properties instead of addding all of them to the constructor
        //firts I should get the properties
        //then I should show a dialog with checkboxes for every property 
        //finally with the selected properties I must create and insert the constructor (ideally before the firts function keyword)

        //let properties=Property.getProperties(editor.document);
       let properties= Property.getPropertiesObjects(editor.document);
        let parameters= this.createFunctionSignature(properties)
        let functionAssigments=this.insertAssigmentInsideConstructor(properties);
        let constructTemplate=`public function __construct(${parameters}){\n${functionAssigments}
        
        }`;

        return constructTemplate;
    }
}