import { expect, it } from 'vitest';
import { validationSeccion1 } from "../src/js/validationsSeccion1.js";

it("Validando que los datos esten completos",()=>{
    const user={
        firstName:"Ana",
        lastName:"Perez",
        email:"ana@ejemplo.com",
        phone:""
    }
   const resultado= validationSeccion1(user)

    expect(resultado).toEqual({})
})

it("datos invalidos",()=>{
      const user={
        firstName:"A",
        lastName:"Perez",
        email:"ana@ejemplo.com",
        phone:""
    }
    const resultado=validationSeccion1(user)
    expect(resultado.firstName).toBe('Debe de tener entre 2 y 80 caractares')
})