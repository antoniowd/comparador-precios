module.exports = {
  apps : [
    {
      name: "www",
      script: "./bin/www",
      watch: true,
      env: {
        "PORT": 3000,
        "NODE_ENV": "production"
      }
    }
  ]
}
