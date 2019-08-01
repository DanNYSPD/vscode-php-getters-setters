import * as path from 'path';

export default class PathUtils{
    /**
     * In theory folderModule path must be longer that root, (becase foldermodule a subdirectory of root)
     * @param root 
     * @param folderModule 
     */
    static getIndexOfDifference(root:string, folderModule:string){
        let i=0;
        while(i<root.length){
            //return as soon they differ 
            if(root.charAt(i)!=folderModule.charAt(i)){
                return i;
            }
            i++
        }
        //if is the same until here it means both string match until this
        return root.length;
        
    }
    static normalizePath(realPath:string){
        if(realPath.includes("\\")&& path.sep!="\\"){
            realPath=realPath.replace("\\",path.sep);
        }else if(realPath.includes("/")&&path.sep!="/"){
            realPath=realPath.replace("/","\\");
        }
        return realPath;
    }
    static haveSameRoot(shortString:string,long:string):boolean{
        //if both are the same until the end of shortString it means both share /have the same root
        return (this.getIndexOfDifference(shortString,long)==shortString.length);
    }
}