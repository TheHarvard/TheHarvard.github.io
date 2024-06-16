
// encode js object to string
function p_encodeJsOb(obj) {
    // Convert object to JSON string
    const jsonString = JSON.stringify(obj);
    // Encode JSON string to Base64
    const base64String = btoa(jsonString);
    return base64String;
}

// encode string to js object
function p_decodeJsOb(encodedString) {
    // Decode Base64 string to JSON string
    const jsonString = atob(encodedString);
    // Parse JSON string to object
    const obj = JSON.parse(jsonString);
    return obj;
}


// ===


// Encrypt a file
function p_encrypt(url,level,key) {
    const ob = {
        url: url,
        level: level,
        key: key
    };
    const ob_encoded = p_encodeJsOb(ob);
    return encodeURIComponent('../p/encrypted.html?ob=' + ob_encoded);
}


function p_decrypt(url, level, key) {
    const urlObject = new URL(url);
    const searchParams = urlObject.searchParams;
    const ob_encoded = searchParams.get("ob");
    const ob = p_decodeJsOb(ob_encoded);
    
    // Check if the key matches
    if (ob.key && key === ob.key) {
        return ob.url;
    }
    
    // Check if the level is sufficient
    if (ob.level && typeof ob.level === "number" && ob.level <= level) {
        return ob.url;
    }
    
    // Return null if decryption fails
    return null;
}


// ===


// Delete a file
function p_delete(url,level) {
}


// Un-delete a file
function p_restore(url,level) {
}


// ===


// Compress a file
function p_compress(url,level) {
}


// Un-compress a file
function p_decompress(url,level) {
}

