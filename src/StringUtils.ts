import { stat } from "fs";

export default class StringUtils{
    /**
     * Gets the text between both strings
     * @param initialMark 
     * @param endMark 
     * @param text 
     */
    static getTextBetween(initialMark:string, endMark:string, text:string):string
    {
        let iniIndex=text.indexOf(initialMark);
        let endIndex=text.indexOf(endMark);

        if(iniIndex!=-1 && endIndex!=1){
            if(iniIndex<endIndex){
              let middle=  text.substr(iniIndex+initialMark.length,endIndex-(iniIndex+initialMark.length)).trim();
              return middle;
            }
        }
        return null;
    }

    static includes(str:string,strings:string[]):boolean{
        let i=0;
        while(i<strings.length ){
            if(!str.includes(strings[i])){
                return false;
            }
            i++;
        }
        return true;
    }

    static includesOr(str:string,strings:string[]){
        let i=0;
        while(i<strings.length ){
            if(str.includes(strings[i])){
                return true;
            }
            i++;
        }
        return false;
    }

    /**
     *  Gets the index of the firts element
     * @param str 
     * @param strings 
     */
    static getIndexPluslengthOfFirst(str:string,strings:string[]):number{
        let i=0;
        while(i<strings.length ){
            let ind=str.indexOf(strings[i])
            if(ind>-1){
                return ind+strings[i].length;
            }
            i++;
        }
        return -1;
    }
}