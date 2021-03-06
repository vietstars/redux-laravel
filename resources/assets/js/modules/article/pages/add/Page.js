// import libs
import React, {Component} from 'react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import {articleAddRequest} from '../../service'
import ReeValidate from 'ree-validate'
import {withRouter} from "react-router-dom";
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

// import components
import Form from './components/Form'

class Page extends Component {
    static displayName = 'AddArticle'
    static propTypes = {
        article: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,

    }

    constructor(props) {
        super(props)

        this.validator = new ReeValidate({
            title: 'required|min:3',
            content: 'required|min:10',
            description: 'required|min:10',
        })

        const article = this.props.article.toJson()

        this.state = {
            article,
            errors: this.validator.errors
        }

        this.handleSubmit = this.handleSubmit.bind(this)
        this.handleChange = this.handleChange.bind(this)
    }

    componentWillReceiveProps(nextProps) {
        const article = nextProps.article.toJson()

        if (!_.isEqual(this.state.article, article)) {
            this.setState({article})
        }

    }

    handleChange(name, value) {
        const {errors} = this.validator

        this.setState({article: {...this.state.article, [name]: value}})

        errors.remove(name)

        this.validator.validate(name, value)
            .then(() => {
                this.setState({errors})
            })
    }

    handleSubmit(e) {
        e.preventDefault()
        const article = this.state.article
        const {errors} = this.validator

        this.validator.validateAll(article)
            .then((success) => {
                if (success) {
                    this.submit(article)
                    this.props.history.push("/articles")
                } else {
                    this.setState({errors})
                }
            })
    }

    submit(article) {
        this.props.dispatch(articleAddRequest(article))
            .catch(({error, statusCode}) => {
                const {errors} = this.validator

                if (statusCode === 422) {
                    _.forOwn(error, (message, field) => {
                        errors.add(field, message);
                    });
                }

                this.setState({errors})
            })
    }

    render() {
        return <Paper className="col-sm-9 mx-auto col-md-10 my-sm-4 p-5">
            <Typography variant="display1" gutterBottom>
                Add
            </Typography>
            <Form {...this.state}
                  onChange={this.handleChange}
                  onSubmit={this.handleSubmit}/>
        </Paper>
    }
}

export default withRouter(Page);
