source ./docker/utils.sh

# Show ivit-i configuration
CONF="ivit-i.json"

S_IP=$(cat ${CONF} | jq -r '.server.ip')
S_PORT=$(cat ${CONF} | jq -r '.server.port')

PORT=$(cat ${CONF} | jq -r '.client.port')
# IP=$(cat ${CONF} | jq -r '.client.ip')
IP=$(python3 -c "from before_demo import extract_ip; print(extract_ip())")

# Update ip information
python3 before_demo.py

# Show the information about Demo Site 
echo ""
printd "\nOpen Browser and enter the IP Addres below, or just hold control and click it." Cy;
TITLE="http://${IP}:${PORT}";

echo -e "${TITLE}" | boxes -s 80x5 -a c;
echo "";
CNT="\n
--- \n
SERVER IP | ${S_IP} \n
SERVER PORT | ${S_PORT} \n
--- \n
CLIENT IP | ${IP} \n
CLIENT PORT | ${PORT} \n
--- \n
"
echo -e $CNT | column -t -s "|"
echo ""

gunicorn --worker-class eventlet -w 1 --threads 10 --bind ${IP}:${PORT} app:app;
