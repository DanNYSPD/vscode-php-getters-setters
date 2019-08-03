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
}