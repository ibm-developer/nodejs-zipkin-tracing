echo "Will generate new keys for localhost testing only in five seconds..."
sleep 5;
rm -rf ./auth
mkdir auth
openssl genrsa -out auth/client-key.pem 2048
openssl req -new -key auth/client-key.pem -out auth/client.csr -subj '/CN=localhost'
openssl x509 -req -in auth/client.csr -signkey auth/client-key.pem -out auth/client-cert.pem
