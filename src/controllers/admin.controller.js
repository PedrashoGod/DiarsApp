import { pool } from '../db.js'
import { encryptPassword, comparePassword } from '../controllers/auth.controller.js'

const nivel = 0;

export const autenticarAdmin = async(req, res) => {

    try{
        
        const {usuario, passwrd} = req.body
        const [auth] = await pool.query('CALL sp_verifica_usuario(?)', usuario)
        
        if(!auth[0][0].resp.length > 1){
            return res.status(404).json({ fallo: "1" })
        }
        
        if(await comparePassword( passwrd, auth[0][0].resp)){

            const [rows]  = await pool.query('CALL sp_iniciar_sesion(?)', [usuario])
            
            if(rows[0][0].fallo.length <= 1){
                return res.status(404).json({ fallo: "1" })
            }
            
            res.json(rows[0][0])
        }
        else{
            
            return res.status(404).json({ fallo: "1" })
        }
    }
    catch(error){
        return res.status(500).json({
            message: 'Ocurrio algun error'
        })
    }
}

export const getAdmin = async(req, res) => {

    try{
        const [rows] = await pool.query('CALL sp_lista_administrador(?)', 'A')
        res.json(rows[0])
    }
    catch(error){
        return res.status(500).json({
            message: 'Ocurrio algun error'
        })
    }
}

export const getAdminId = async(req, res) => {

    try{
        const [rows] = await pool.query('CALL sp_lista_administrador(?)', [req.params.id])
    
        if(rows[0].length <= 0 || rows[0][0].fallo === "1"){
            return res.status(404).json({ fallo: "1" })
        }
        else{
            res.json(rows[0][0])
        }
    }
    catch(error){
        return res.status(500).json({
            message: 'Ocurrio algun error'
        })
    }
}

export const createAdmin = async (req, res) => {

    try{
        const {nombre, apellidos, dni, telefono, email} = req.body
        const passwrd = await encryptPassword(dni)

        const [rows] = await pool.query('CALL sp_insertar(?,?,?,?,?,?,?)', [nombre, apellidos, dni, telefono, email, passwrd, nivel])

        if(rows[0].length <= 0 || rows[0][0].fallo === "1"){
            return res.status(404).json({ fallo: "1" })
        }else{
            res.json(rows[0][0])
        }
        
    }
    catch(error){
        return res.status(500).json({
            message: 'Ocurrio algun error'
        })
    }
}

export const updateAdmin = async(req, res) => {

    try{
        const {id} = req.params
        const {nombre, apellidos, dni, telefono, email, usuario, passwrd, estado} = req.body
        let pass = passwrd

        if ( pass !== null ){
            pass = await encryptPassword(passwrd)
        }

        const [result] = await pool.query('CALL sp_actualizar( ?,?,?,?,?,?,?,?,?,? )',[id, nombre, apellidos, dni, telefono, email, usuario, pass, estado, nivel])

        if(result[0][0].fallo === "1"){
            return res.status(404).json({ fallo: "1" })
        }else{
            res.json(result[0][0])
        }
    }
    catch(error){
        return res.status(500).json({
            message: 'Ocurrio algun error'
        })
    }
}

export const deleteAdmin = async(req, res) => {

    try{
        const [result] = await pool.query('CALL sp_eliminar(?)', [req.params.id])

        if(result[0][0].fallo === "1"){
            return res.status(404).json({ fallo: "1" })
        }else{
            res.json(result[0][0])
        }
    }
    catch(error){
        return res.status(500).json({
            message: 'Ocurrio algun error'
        })
    }
}

export const estadoAdmin = async(req, res) => {

    try{
        const {id} = req.params
        const {estado} = req.body
        
        const [result] = await pool.query('CALL sp_cambiar_estado( ?,?,? )',[id, estado, nivel])

        if(result[0][0].fallo === "1"){
            return res.status(404).json({ fallo: "1" })
        }else{
            res.json(result[0][0])
        }
    }
    catch(error){
        return res.status(500).json({
            message: 'Ocurrio algun error'
        })
    }
}

export const cambiarPassAdmin = async(req, res) => {

    try{
        const {id} = req.params
        const {usuario, oldpasswrd , newpasswrd} = req.body
        let pass = newpasswrd

        const [auth] = await pool.query('CALL sp_verifica_usuario(?)', usuario) //devuelve pass

        if(!auth[0][0].resp.length > 1){
            return res.status(404).json({ fallo: "1" })
        }

        if(await comparePassword( oldpasswrd, auth[0][0].resp)){ //verifica pass

            pass = await encryptPassword(newpasswrd) //encripta newpass

            const [result] = await pool.query('CALL sp_cambiar_pass( ?,?,? )',[id, auth[0][0].resp, pass])
            
            if(result[0][0].fallo === "1"){
                return res.status(404).json({ fallo: "1" })
            }
            
            res.json(result[0][0])
        }
        else{
            return res.status(404).json({ fallo: "1" })
        }
    }
    catch(error){
        return res.status(500).json({
            message: 'ocurrio un error'
        })
    }
}