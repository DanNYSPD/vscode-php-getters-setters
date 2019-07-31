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
}