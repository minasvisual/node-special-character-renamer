const fs = require('fs')
const path = require('path')
const ID3 = require('./id3')
const Rename = require('./rename')

var buffer = {}
var args = process.argv.slice(2);

const testFolder = args[0];
const action = args[1];
const addParam = args[2] || null;

const readFolder = async (folder) => {
	return new Promise((res, rej) => {
		fs.readdir(folder, async (err, files) => {
			if(err) rej(err)
			else res(files)
		})
	})
}

const renameFileToMeta = async ({file}) => {
      let filepath = path.resolve(testFolder,file);
      console.log('Rename file to meta: ' + filepath)
      let fileParts = file.replace('.mp3', '').split('-')
      let tags = {
          title: ( fileParts[1] || file ),
          artist: ( fileParts[0] || file )
      }
      ID3.writeTags(filepath, tags, (err, tags) =>{
        if( err )
          console.log('Tags modified error', filepath, tags )

        fs.rename(testFolder+'\\'+file, testFolder+'\\'+Rename.replaceDiacritics(file) , (err) =>{
          if(err) console.log(err)
        } )
      })
}

const renameMetaToFile = async ({file}) => {
      let filepath = path.resolve(testFolder,file);
      console.log('Rename meta to file: ' + filepath)

      ID3.readTags(filepath, (err, tags) =>{
        if( err )
          console.log('Tags read error', filepath, err )

        let newname = `${ tags.artist } - ${ tags.title }.mp3`

        fs.rename(testFolder+'\\'+file, testFolder+'\\'+Rename.replaceDiacritics(newname) , (err) =>{
          if(err) console.log(err)
        } )
      })
}


const sanitizeFile = async ({file}) => {
  let filepath = path.resolve(testFolder,file);
  console.log('Sanitize file' + filepath)
  fs.rename(testFolder+'\\'+file, testFolder+'\\'+Rename.replaceDiacritics(file) , (err) =>{
    if(err) console.log(err)
  } )
}


const moveDuplicated = async ({file}) => {
  return new Promise(async (res, rej) => {
	if( !buffer['filesbase'] ) buffer['filesbase'] = await readFolder(addParam)  
	
	let duplicatedPath = path.resolve(testFolder,'duplicated')

	if( buffer['filesbase'].includes(file) ){
		if ( !fs.existsSync( duplicatedPath ) )  fs.mkdirSync(duplicatedPath);
		
		fs.rename(path.resolve(testFolder,file), path.resolve(duplicatedPath, file), (err, data) => { 
			if(err) rej(err)
			else res(data)
		})
	}
	res(file)
  })
}

const runner = async function(){
  if (fs.existsSync(testFolder)) {
    let files = await readFolder(testFolder)

    for( let file of files ){
      //console.log(file + ' >> ' + replaceDiacritics(file) );
      if( action == "moveduplicated" && addParam )
	await moveDuplicated({file})

      if( action == 'filetometa' )
        await renameFileToMeta({file})

      if( action == 'metatofile')
        await renameMetaToFile({file})

      if( action == 'sanitize')
        await sanitizeFile({file})

      // let filepath = path.resolve(testFold
    }
    console.log('END')
 	
    buffer = {}
  }else{
    console.log('Folder not exists')
  }
}

runner()
console.log('folder ', args[0])



