export default class GenerateTemplate{
    /**
     * Given a text, this method converts it into a js template
     * @param content text to convert into a template
     */
    static generateForVs(content:string){
        let lines=content.split(`\n`);
        let template='return ';
        const s=`\``;
        for(let i=0;i<lines.length;i++){
            
            
            template+=s+`\\t`+`\`+`+s+lines[i]+s+`+\``+`\\n`+`\``+(i==lines.length-1?';':'+\n');
             
        }
    //let d=    `\t`+`    $app->get('/instancia/general', 'InstanciaController:CargarDatosGenerales');`+`\n`;

        return template;
    }
}