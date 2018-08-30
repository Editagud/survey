//@flow
import React from "react";
import ReactDOM from "react-dom";
const uuidv1 = require("uuid/v1");

type QuestionType = {
  type:
    | "short-text"
    | "long-text"
    | "name"
    | "email"
    | "number"
    | "multiple-choice"
    | "drop-down"
    | "check-boxes",
  name: string,
  value: string | number,
  required: boolean,
  ticket_type: string
};

const PassiveTextInput = ({ id, label }) => (
  <input disabled placeholder={label} />
);

let questionMap = {
  "short-text": {
    label: "Short reply",
    AnswerInput: PassiveTextInput
  },
  "long-text": {
    label: "Long reply",
    AnswerInput: PassiveTextInput
  },
  name: {
    label: "Short reply",
    AnswerInput: PassiveTextInput
  },
  email: {
    label: "Short reply",
    AnswerInput: PassiveTextInput
  },
  number: {
    label: "Short reply",
    AnswerInput: PassiveTextInput
  },
  "drop-down": {
    label: "Multiple choice",
    AnswerInput: PassiveTextInput
  },
  "check-boxes": {
    label: "Short reply",
    AnswerInput: PassiveTextInput
  }
};

let App = ({
  questions = {
    order: [{ id: 0, type: "short-text", name: "The orederers name" }],
    attendee: [
      {
        id: 1,
        type: "short-text",
        ticket_type: "Gold",
        name: "The gold buyers name"
      },
      {
        id: 2,
        type: "short-text",
        ticket_type: "Silver",
        name: "The gold buyers name"
      }
    ]
  },
  ticketTypes = [
    {
      id: "silver",
      label: "Silver"
    },
    {
      id: "gold",
      label: "Gold"
    },
    {
      id: "bronze",
      label: "Bronze"
    }
  ]
}: {
  questions: {
    order: Array<QuestionType>,
    attendee: Array<QuestionType & { ticket_type: string }>
  }
}) => {
  return (
    <div>
      <div>
        <h1>Order questions</h1>
        <QuestionSet initialQuestions={questions.order} />
        <h1>attendee questions</h1>
        <QuestionSet
          initialQuestions={questions.attendee}
          groupedByKey="ticket_type"
          groupOptions={ticketTypes}
        />
      </div>
    </div>
  );
};

function QuestionSet({
  initialQuestions,
  groupedByKey = null,
  groupOptions
}: {
  initialQuestions: Array<Question>,
  groupedByKey: null | string
}) {
  return (
    <Form defaultValues={{ questions: initialQuestions }}>
      {({ questions, updateValue }) => {
        let questionsByGroup = {};
        if (groupedByKey) {
          let keys = [
            ...new Set(questions.map(question => question[groupedByKey]))
          ];
          keys.forEach(key => {
            questionsByGroup[key] = questions.filter(
              question => question[groupedByKey] === key
            );
          });
        }
        return (
          <PickOne>
            {(activeInputId, changeActiveInput) => {
              function addQuestion(props = {}) {
                let id = questions.length + 2;
                updateValue(({ questions }) => ({
                  questions: [
                    ...questions,
                    { id, type: "short-text", ...props }
                  ]
                }));
                changeActiveInput(id);
              }
              function renderQuestion(question) {
                return (
                  <Question
                    key={question.id}
                    active={activeInputId === question.id}
                    question={question}
                    groupedByKey={groupedByKey}
                    groupOptions={groupOptions}
                    onClick={() => {
                      changeActiveInput(question.id);
                    }}
                    onOutsideClick={() => changeActiveInput(null)}
                    updateValue={updateValue}
                    updateQuestion={props => {
                      updateValue(({ questions }) => ({
                        questions: questions.map(
                          q =>
                            q.id === question.id
                              ? {
                                  ...q,
                                  ...props
                                }
                              : q
                        )
                      }));
                    }}
                  />
                );
              }
              return (
                <div>
                  {groupedByKey ? (
                    <div>
                      {Object.keys(questionsByGroup).map(value => {
                        return (
                          <div key={value}>
                            <h3>{value}</h3>
                            {questionsByGroup[value].map(renderQuestion)}
                            <div
                              style={{
                                color: "blue"
                              }}
                              onClick={() =>
                                addQuestion({ ticket_type: value })
                              }
                            >
                              + Add new question for {value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <React.Fragment>
                      {questions.map(renderQuestion)}
                      <div onClick={() => addQuestion()}>Add new question</div>
                    </React.Fragment>
                  )}
                </div>
              );
            }}
          </PickOne>
        );
      }}
    </Form>
  );
}

let Question = ({
  question,
  active,
  updateValue,
  updateQuestion,
  groupedByKey,
  groupOptions,
  ...props
}) => {
  let { AnswerInput } = questionMap[question.type];
  return (
    <ClickedOutside
      key={question.id}
      style={
        active
          ? {
              border: "1px solid grey",
              padding: "10px",
              boxShadow: "1px 1px 5px 0 #a5a5a5"
            }
          : {}
      }
      {...props}
    >
      {groupedByKey && (
        <select
          onChange={({ target }) => {
            updateQuestion({ [groupedByKey]: target.value });
          }}
          value={question[groupedByKey]}
        >
          {groupOptions.map(({ id, label }) => (
            <option key={id} id={id}>
              {label}
            </option>
          ))}
        </select>
      )}
      <input
        placeholder="Question name"
        value={question.name}
        onChange={({ target }) => {
          updateQuestion({ name: target.value });
        }}
      />
      <AnswerInput {...question} />
      <div
        style={{ float: "right" }}
        onClick={() => {
          if (
            window.confirm(`Are you sure you want to delete "${question.name}"`)
          ) {
            updateValue(({ questions }) => ({
              questions: questions.filter(q => q.id !== question.id)
            }));
          }
        }}
      >
        Delete
      </div>
    </ClickedOutside>
  );
};

class ClickedOutside extends React.Component<{
  onOutsideClick: Event => void
}> {
  state = { clicked: false };
  ref = React.createRef();
  componentDidMount() {
    document.addEventListener("click", this.handleClick, false);
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.handleClick, false);
  }
  handleClick = e => {
    let ref = this.ref.current;
    if (ref && !ref.contains(e.target)) {
      this.props.onOutsideClick && this.props.onOutsideClick(e);
    }
  };
  render() {
    let { children, onOutsideClick, ...rest } = this.props;
    return (
      <div ref={this.ref} {...rest}>
        {this.props.children}
      </div>
    );
  }
}

type FormState = {
  values: any,
  errors: { [string]: any },
  submitting: boolean,
  submitError: null | string,
  success: boolean
};

export class Form extends React.Component<
  {
    validateFields: Array<{
      id: string,
      validate: "exists" | "phone" | "email"
    }>,
    defaultValues: { [string]: any },
    action: string,
    onChange?: ({ [string]: any }) => void,
    onSubmit?: ({ [string]: any }) => void,
    children: (
      FormState & {
        updateValue: (value: { [string]: any }) => void,
        handleSubmit: () => void
      }
    ) => React.ReactElement<*>
  },
  FormState
> {
  static defaultProps = {
    defaultProps: {}
  };
  state = {
    ...this.props.defaultValues,
    errors: {},
    submitting: false,
    submitError: null,
    success: false
  };
  check = {
    exists: value => value && value.length > 0
  };
  messages = {
    exists: "This field is required"
  };
  getErrors = () => {
    let fields = this.props.validateFields;
    let errors = {};
    let validatedFields = fields.filter(
      field =>
        !this.state.values[field.id] &&
        (field.validate
          ? !this.check[field.validate](this.state.values[field.id])
          : false)
    );
    validatedFields.forEach(({ id, validate }) => {
      errors = { ...errors, [id]: this.messages[validate] };
    });
    return errors;
  };
  postForm = async () => {
    this.setState({ submitting: true });
    try {
      // let req = await post(
      //   window.globalvars.ajax_url,
      //   this.props.action,
      //   JSON.stringify(this.state.values)
      // );
      // let res = JSON.parse(req);
      // if (res.success) {
      //   this.setState({ success: true, submitting: false });
      // } else {
      //   this.setState({
      //     submitting: false,
      //     submitError: res.msg
      //   });
      // }
    } catch (e) {
      this.setState({
        submitting: false,
        submitError:
          "There was an error submitting your application. Please try again."
      });
    }
  };
  updateValue = (values: { [string]: any }) => {
    // let ids = Object.keys(values);
    this.setState(
      ({ errors }) => {
        let newErrors = {};
        // Object.keys(errors).forEach(key => {
        //   if (!ids.includes(key)) {
        //     newErrors = { ...newErrors, [key]: errors[key] };
        //   }
        // });
        return { ...values, errors: newErrors };
      },
      () => {
        if (this.props.onChange) this.props.onChange(this.state.values);
      }
    );
  };
  render() {
    return this.props.children({
      updateValue: arg =>
        typeof arg === "function"
          ? this.updateValue(arg(this.state))
          : this.updateValue(arg),
      handleSubmit: async () => {
        let errors = this.getErrors();
        if (Object.keys(errors).length > 0) {
          this.setState({ errors });
        } else {
          this.postForm();
        }
      },
      ...this.state
    });
  }
}

export class PickOne extends React.Component<
  {
    children: (any, (number) => void) => Array<React.Element<*>>,
    defaultValue: number
  },
  {
    value: number
  }
> {
  static defaultProps = {
    defaultValue: null
  };
  state = { value: this.props.defaultValue };
  render() {
    return this.props.children(this.state.value, value => {
      this.setState({ value });
    });
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
