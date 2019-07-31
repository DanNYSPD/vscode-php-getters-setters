export class Names {

     /**
     * Converts the name to camelCase
     * for example "ERROR_CODE" will be "ErrorCode" (all underscore are remove, 
     * and the first letter after them is considered as a word start , so it's converted to Upper.)
     * 
     * note: consider for future to support other styles, for example :
     * >const errorCode='';
     * In this case it doesn't use _ underscores, so it will not work.
     * @param name string
     */
    static toCamelCase(name:string){
        var parts=name.split('_')
        var camelCaseName='';
        parts.forEach(p=>{
                camelCaseName+= p.charAt(0).toUpperCase()+p.slice(1).toLowerCase();
            }
        );
        return camelCaseName;
    }

    static toLowerCamelCase(name:string){
        if(name.includes('_')){
            var parts=name.split('_');
            let loweCamel='';
            parts.forEach(p=>{
                loweCamel+=p.charAt(0).toUpperCase()+p.slice(1).toLowerCase();
            })
            return loweCamel.charAt(0).toLowerCase()+loweCamel.slice(1);
        }else{
            //if names doesn't include underscore just make the firts letter lowercase
            return name.charAt(0).toLowerCase()+name.slice(1).toLowerCase()
        }
    }
}