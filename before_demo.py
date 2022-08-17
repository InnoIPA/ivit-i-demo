import os, socket, argparse, json

CONF="/workspace/ivit-i.json"

BASIC_NAME_MAP={
    "nvidia": [
        "nvidia", "nv", "tensorrt", "trt"
    ],
    "intel": [
        "intel", "openvino", "vino"
    ]
}

BASIC_PORT_MAP={
    "nvidia": "818",
    "intel": "819"
}

MODIFY_JS=['./static/js/entry.js', './static/js/stream.js']
MODIFY_PY=['app.py']

def extract_ip():
    st = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:       
        st.connect(('10.255.255.255', 1))
        IP = st.getsockname()[0]
    except Exception:
        IP = '127.0.0.1'
    finally:
        st.close()
    return IP

if __name__ == '__main__':

    parser = argparse.ArgumentParser()
    parser.add_argument("-i", "--ip", default="", help="the ivit-i-<platform> ip address")
    parser.add_argument("-p", "--port", default="", help="the ivit-i-<platform> port number")
    args = parser.parse_args()

    data = None
    ip, port = "", ""

            
    # Parse the configuration
    with open(CONF, 'r') as f:
        data = json.load(f)
    if args.port=="":
        print("Using configuration content -> {}:{}".format("port", data['server']["port"]))
        port = data['server']['port']
    if args.ip=="":
        print("Using configuration content -> {}:{}".format("ip", data['server']["ip"]))
        ip = data['server']['ip']
        if ip=="":
            print("User not setting IP Address, searching dynamically ... ")
            ip = extract_ip()
    
    # Modify JavaScript File
    cnts, lines, texts = [], [], []
    for file in MODIFY_JS:
        
        # Open and searching
        with open(file, 'r') as f:
            src = f.readlines()
        
        for line, content in enumerate(src):
            
            if 'const DOMAIN' in content:
                print('-'*50, '\n')
                print('Searching DOMAIN in {} ... '.format(file))
                print('Found DOMAIN in line {}: {}'.format(line, content.rstrip()))
                
                trg_cnt = "{} = '{}';\n".format(content.split(' = ')[0], ip )
                src[line] = trg_cnt
                print('Modify the DOMAIN: {}'.format(ip))
                continue

            if 'const PORT' in content:
                trg_cnt = "{} = '{}';\n".format(content.split(' = ')[0], port )
                src[line] = trg_cnt
                print('Modify the PORT: {}'.format(port))
            

        # Wrtie file
        with open('{}'.format(file), 'w') as my_file:
            new_file_contents = "".join(src)
            my_file.write(new_file_contents)
            my_file.close()
    # -------------------------------------------------------------------------------------------
    for pyfile in MODIFY_PY:
        print("Modify Python File ({})".format(pyfile))
        with open(pyfile, 'r') as f:
            src = f.readlines()

        for line, content in enumerate(src):

            key = "app.config['HOST']"
            if key in content:
                src[line]="{}='{}'\n".format( key, ip )
            key = "app.config['PORT']"
            if key in content:
                src[line]="{}='{}'\n".format( key, port )
                break

        with open(pyfile, 'w') as f:
            new_cnt = "".join(src)
            f.write(new_cnt)
            f.close()