from app import models
from app import db, create_app
import unittest
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager
import os
from dotenv import load_dotenv
load_dotenv()


app = create_app(config_name=os.getenv('APP_SETTINGS'))
migrate = Migrate(app, db)
manager = Manager(app)

manager.add_command('db', MigrateCommand)


@manager.command
def test():
    """Runs the unit tests without test coverage."""
    tests = unittest.TestLoader().discover('./tests', pattern='test*.py')
    result = unittest.TextTestRunner(verbosity=2).run(tests)
    if result.wasSuccessful():
        return 0
    return 1


@manager.command
def create_db():
    db.drop_all()
    db.create_all()
    db.session.commit()
        
@manager.command
def recreate_db():
    db.create_all()
    db.session.commit()


if __name__ == '__main__':
    manager.run()
