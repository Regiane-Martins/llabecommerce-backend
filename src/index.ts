import {
  createUser,
  getAllUsers,
  createProduct,
  getAllProducts,
} from "./database.js";
import express, { Request, Response } from "express";
import { users, products } from "./database";
import { TProducts, TUser } from "./types";
import cors from "cors";
import { db } from "./database/knex"

const app = express();
app.use(express.json());
app.use(cors());

app.listen(3003, () => {
  console.log("Servidor rodando na porta 3003");
});

// endpoitn test

app.get("/ping", (req: Request, res: Response) => {
  res.send("pong");
});


//Get All Users

app.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await db("users")
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Usuário não localizado!");
  }
});

//Get All Products

app.get("/products", async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    if (name === undefined || name === "") {
      const result = await db("products")

      res.status(200).send(result)
    } else {
      const result = await db("products").where("name", "LIKE", `%${name}%`)
      res.status(200).send(result);
    }
  } catch (error) {
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.status(500).send("Erro desconhecido.");
    }
  }
});


// Get Product By Id

// app.get('/products/:id', async (req: Request, res: Response) => {
//   try {
//     const { id } = req.params

//     if (id !== undefined) {
//       if (typeof id !== "string") {
//         res.statusCode = 400;
//         throw new Error("Íd' deve ser em formato de texto!")
//       }
//       if (id.length < 1) {
//         res.statusCode = 400;
//         throw new Error("'Id' deve conter mais de um carater!")
//       }
//       const [product] = await db("products").where({ id: id })
//       res.status(200).send(product)
//       if (!product) {
//         res.statusCode = 404
//         throw new Error("'id' não encontrada")
//       }
//     }

//   } catch (error) {
//     if (error instanceof Error) {
//       res.send(error.message);
//     } else {
//       res.status(500).send("Erro desconhecido.");
//     }
//   }
// })

// create user

app.post("/users", async (req: Request, res: Response) => {
  try {
    const { id, name, email, password } = req.body;

    const newUser = {
      id: id,
      name: name,
      email: email,
      password: password
    }

    await db("users").insert(newUser)

    const userById = users.findIndex((user) => user.id === id);

    if (userById >= 0) {
      res.statusCode = 400;
      throw new Error("Id já cadastrado, favor criar novo 'Id'!");
    }

    const existingEmail = users.find((user) => user.email === email);

    if (existingEmail !== undefined) {
      if (existingEmail) {
        res.statusCode = 400;
        throw new Error("E-mail já cadastrado, favor inserir e-mail válido!");
      }
    }
    res.status(201).send("Cadastro realizado com sucesso!");
  } catch (error) {
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.status(500).send("Erro desconhecido.");
    }
  }
});

// create products

app.post("/products", async (req: Request, res: Response) => {
  try {
    const { id, name, price, description, image_url } = req.body;

    const newProduct = {
      id: id,
      name: name,
      price: price,
      description: description,
      image_url: image_url
    }

    await db("products").insert(newProduct)

    const productById = products.findIndex((product) => product.id === id);
    if (productById >= 0) {
      res.statusCode = 400;
      throw new Error("Id já cadastrado, favor enserir um novo 'id'!");
    }

    res.status(201).send("Produto cadastrado com sucesso!");
  } catch (error) {
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.status(500).send("Erro desconhecido.");
    }
  }
});

// Create Purchase

app.post('/purchases', async (req: Request, res: Response) => {
  try {
    const { id, buyer, products } = req.body

    if(!id || ! buyer || !products){
      res.statusCode=400
      throw new Error("Dados inválidos, verifique as informações fornecidas.")

    }
    const newRequest = {
      id: id,
      buyer: buyer
    }

    await db("purchases").insert(newRequest)
  
    res.status(200).send("Pedido realizado com sucesso.")

  } catch (error) {
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.status(500).send("Erro desconhecido.");
    }
  }
})

//Delete Purchases by id

app.delete("/purchases/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [purchase] = await db("purchases").where({ id: id })

    if (!purchase) {
      res.status(404)
      throw new Error("'id' não encontrada")
    }

    await db("purchase").del().where({ id: id })

    res.status(200).send("Pedido cancelado com sucesso!");
  } catch (error) {
    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.status(500).send("Erro desconhecido.")
    }
  }

});

//Delete Product by id

// app.delete("/products/:id", (req: Request, res: Response) => {
//   try {
//     const { id } = req.params;
//     const productById = products.findIndex((product) => product.id === id);
//     if (productById !== undefined) {
//       if (productById < 0) {
//         res.statusCode = 400
//         throw new Error("Produto não encontrado!")
//       }
//     }

//     products.splice(productById, 1);

//     res.status(200).send("Produto exluido com sucesso!");
//   } catch (error) {
//     if (error instanceof Error) {
//       res.send(error.message)
//     } else {
//       res.status(500).send("Erro desconhecido.")
//     }
//   }

// });

//Edit Product by id

app.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const newId = req.body.id as string;
    const newName = req.body.name as string;
    const newPrice = req.body.price as number;
    const newDescription = req.body.description as string;
    const newImage = req.body.imageUrl as string;

    const [product] = await db("products").where({ id: id })
    if (product) {
      const updateProduct = {
        id: newId || product.id,
        name: newName || product.name,
        price: newPrice || product.price,
        description: newDescription || product.description,
        image_url: newImage || product.image_url
      }

      await db("products").update(updateProduct).where({ id: id })
    } else {
      res.status(404)
      throw new Error("'id' não encontrada")
    }

    res.status(200).send("Produto atualizado com sucesso")
  } catch (error) {
    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.status(500).send("Erro desconhecido.")
    }
  }
  ;
});

// Get Purchase By Id

app.get('/purchases/:id', async (req: Request, res: Response) => {
  try {

    const id = req.params.id

    if (id !== undefined) {
      if (typeof id !== "string") {
        res.statusCode = 400;
        throw new Error("Íd' deve ser em formato de texto!")
      }
      if (id.length < 1) {
        res.statusCode = 400;
        throw new Error("'Id' deve conter mais de um carater!")
      }
      const [result] = await db("purchases").where({ id: id })
      res.status(200).send(result)
      if (!result) {
        res.statusCode = 404
        throw new Error("'id' não encontrada")
      }
    }

  } catch (error) {
    if (error instanceof Error) {
      res.send(error.message)
    } else {
      res.status(500).send("Erro desconhecido.")
    }
  }
})
