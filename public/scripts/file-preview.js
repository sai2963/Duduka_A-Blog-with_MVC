const filePickerElement= document.getElementById('imageupload');
const imagePreviewElement=document.getElementById('image-preview');

function showPreview(){
    const file=filePickerElement.files;
    if(!file || file.length ===0){
        imagePreviewElement.style.display="none";
        return;
    }
    const pickedFile=file[0];
    
    imagePreviewElement.src=URL.createObjectURL(pickedFile);
    imagePreviewElement.style.display="block";
}
filePickerElement.addEventListener('change',showPreview)