from flask import Flask, request, jsonify, send_file
import fitz  # PyMuPDF
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/convert', methods=['POST'])
def convert_pdf_to_html():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    filename = secure_filename(file.filename)
    pdf_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(pdf_path)

    doc = fitz.open(pdf_path)
    html_output = "<html><body>"

    for page in doc:
        html_output += f"<h3>Page {page.number + 1}</h3>"
        text = page.get_text()
        html_output += f"<p>{text}</p>"

        images = page.get_images(full=True)
        for img_index, img in enumerate(images):
            xref = img[0]
            base_image = doc.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            image_filename = f"page{page.number+1}_img{img_index}.{image_ext}"
            image_path = os.path.join(UPLOAD_FOLDER, image_filename)

            with open(image_path, "wb") as img_file:
                img_file.write(image_bytes)

            # Embed image in HTML
            html_output += f'<img src="data:image/{image_ext};base64,{base64_encode(image_path)}" /><br>'

    html_output += "</body></html>"
    return html_output, 200, {'Content-Type': 'text/html'}


def base64_encode(image_path):
    import base64
    with open(image_path, "rb") as img_file:
        return base64.b64encode(img_file.read()).decode('utf-8')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
