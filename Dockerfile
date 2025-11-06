# -----------------------------
# Etapa 1: build da aplicação
# -----------------------------
FROM node:20-alpine AS build

# Diretório de trabalho
WORKDIR /app

# Copia apenas os arquivos de dependência primeiro
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código
COPY . .

# Build de produção
RUN npm run build

# -----------------------------
# Etapa 2: servidor estático
# -----------------------------
FROM nginx:alpine

# Remove arquivos padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia o build do Vite para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe a porta padrão HTTP
EXPOSE 80

# Sobe o Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
