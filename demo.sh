ROOT=$(dirname $(realpath $0))
source "${ROOT}/utils.sh"

# Show ivit-i configuration
CONF="ivit-i.json"

S_IP=$(cat ${CONF} | jq -r '.server.ip')
S_PORT=$(cat ${CONF} | jq -r '.server.port')

PORT=$(cat ${CONF} | jq -r '.client.port')
# IP=$(cat ${CONF} | jq -r '.client.ip')
IP=$(python3 -c "from before_demo import extract_ip; print(extract_ip())")

# Help information
function help(){
	echo "Run the iVIT-I-DEMO environment."
	echo
	echo "Syntax: scriptTemplate [-f|b|i|p]"
	echo "options:"
	# echo "b		brand or platform"   
    echo "i		ip"
    echo "p		port"
	echo "h		help."
}

# Parse the argument
while getopts "b:i:p:h" option; do
	case $option in
		i )
			IP=$OPTARG ;;
        p )
			PORT=$OPTARG ;;
        h )
			help; exit ;;
		\? )
			help; exit ;;
		* )
			help; exit ;;
	esac
done

# Update the parameters of configuration
CNT=$(jq \
--arg ip "${IP}" --arg port "${PORT}" \
'.server.ip = $ip | .server.port = $port' \
${CONF})

echo -E "${CNT}" > ${CONF}

# Update ip information
python3 before_demo.py

# Show the information about Demo Site 
echo ""
printd "\nOpen Browser and enter the IP Addres below, or just hold control and click it." Cy
TITLE="http://${IP}:${PORT}"

echo -e "${TITLE}" | boxes -s 80x5 -a c
echo ""
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
