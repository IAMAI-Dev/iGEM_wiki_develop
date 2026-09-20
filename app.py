from os import path

from flask import Flask, render_template
from flask_frozen import Freezer

template_folder = path.abspath('./wiki')


app = Flask(__name__, template_folder=template_folder)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['FREEZER_DESTINATION'] = 'public'
app.config['FREEZER_RELATIVE_URLS'] = True
app.config['FREEZER_IGNORE_MIMETYPE_WARNINGS'] = True
freezer = Freezer(app)

@app.cli.command()
def freeze():
    freezer.freeze()

@app.cli.command()
def serve():
    freezer.run()


# ==================== 路由 ====================

@app.route('/')
def home():
    return render_template('home.html',
        is_subpage=False,
        active_nav='Project',
        current_path='/')

@app.route('/project/description/')
def project_description():
    return render_template('pages/project/description.html',
                           is_subpage=True,
                           active_nav='Project',
                           current_path='/project/description')

@app.route('/project/design/')
def project_design():
    return render_template('pages/project/design.html',
                           is_subpage=True,
                           active_nav='Project',
                           current_path='/project/design')

@app.route('/wetlab/engineering/')
def wetlab_engineering():
    return render_template('pages/wetlab/engineering.html',
        is_subpage=True,
        active_nav='Wet-Lab',
        current_path='/wetlab/engineering')


@app.route('/wetlab/results/')
def wetlab_results():
    return render_template('pages/wetlab/results.html',
        is_subpage=True,
        active_nav='Wet-Lab',
        current_path='/wetlab/results')


@app.route('/wetlab/protocal/')
def wetlab_protocal():
    return render_template('pages/wetlab/protocal.html',
        is_subpage=True,
        active_nav='Wet-Lab',
        current_path='/wetlab/protocal')


@app.route('/wetlab/parts/')
def wetlab_parts():
    return render_template('pages/wetlab/pending.html',
        is_subpage=True,
        active_nav='Wet-Lab',
        current_path='/wetlab/parts',
        section_title='Parts',
        section_title_zh='生物部件')


@app.route('/wetlab/notebook/')
def wetlab_notebook():
    return render_template('pages/wetlab/pending.html',
        is_subpage=True,
        active_nav='Wet-Lab',
        current_path='/wetlab/notebook',
        section_title='Notebook',
        section_title_zh='实验记录')


@app.route('/wetlab/safety/')
def wetlab_safety():
    return render_template('pages/wetlab/safety.html',
        is_subpage=True,
        active_nav='Wet-Lab',
        current_path='/wetlab/safety')

@app.route('/drylab/naphthalene/')
def drylab_naphthalene():
    return render_template('pages/drylab/naphthalene.html',
        is_subpage=True,
        active_nav='Dry-Lab',
        current_path='/drylab/naphthalene')

@app.route('/drylab/salicylic-acid/')
def drylab_salicylic_acid():
    return render_template('pages/drylab/salicylic-acid.html',
        is_subpage=True,
        active_nav='Dry-Lab',
        current_path='/drylab/salicylic-acid')

@app.route('/engagement/ihp/')
def engagement_ihp():
    return render_template('pages/engagement/ihp.html',
        is_subpage=True,
        active_nav='Engagement',
        current_path='/engagement/ihp')

@app.route('/team/members/')
def team_members():
    return render_template('pages/team/members.html',
        is_subpage=True,
        active_nav='Team',
        current_path='/team/members')

# Main Function, Runs at http://0.0.0.0:5000
if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)
